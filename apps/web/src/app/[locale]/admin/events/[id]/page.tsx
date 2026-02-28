import { createDb, events, eventCategories, ticketTypes, eventRegistrations } from '@yeshe/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/authz';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateEvent(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const titleSv = String(formData.get('titleSv') || '').trim();
  const titleEn = String(formData.get('titleEn') || '').trim();
  const descSv = String(formData.get('descriptionSv') || '').trim();
  const descEn = String(formData.get('descriptionEn') || '').trim();
  const startsAt = String(formData.get('startsAt') || '').trim();
  const endsAt = String(formData.get('endsAt') || '').trim();
  const venue = String(formData.get('venue') || '').trim();
  const venueAddress = String(formData.get('venueAddress') || '').trim();
  const isOnline = formData.get('isOnline') === 'on';
  const published = formData.get('published') === 'on';
  const featuredImageUrl = String(formData.get('featuredImageUrl') || '').trim();
  const categoryId = String(formData.get('categoryId') || '').trim() || null;
  const venueId = String(formData.get('venueId') || '').trim() || null;
  const organizerId = String(formData.get('organizerId') || '').trim() || null;
  let memberIncluded = formData.get('memberIncluded') === 'on';
  const featured = formData.get('featuredEvent') === 'on';
  const extraCategoryIds = formData.getAll('extraCategoryIds').map(String).filter(Boolean);

  if (!titleSv || !startsAt) return;

  if (!memberIncluded && categoryId) {
    const { rows } = await pool.query("SELECT value FROM app_settings WHERE key='events.member_included_default_categories' LIMIT 1");
    const slugs: string[] = rows?.[0]?.value || [];
    if (Array.isArray(slugs) && slugs.length) {
      const { rows: catRows } = await pool.query('SELECT slug FROM event_categories WHERE id = $1 LIMIT 1', [categoryId]);
      const slug = catRows?.[0]?.slug;
      if (slug && slugs.includes(slug)) memberIncluded = true;
    }
  }

  await db.update(events).set({
    titleSv, titleEn: titleEn || titleSv,
    descriptionSv: descSv || null, descriptionEn: descEn || null,
    startsAt: new Date(startsAt),
    endsAt: endsAt ? new Date(endsAt) : null,
    venue: venue || null, venueAddress: venueAddress || null,
    isOnline, published,
    featuredImageUrl: featuredImageUrl || null,
    categoryId,
    updatedAt: new Date(),
  }).where(eq(events.id, id));

  await pool.query(`UPDATE events SET venue_id = $1, organizer_id = $2, member_included = $3 WHERE id = $4`, [venueId, organizerId, memberIncluded, id]);

  // featured list in app_settings
  const fr = await pool.query("SELECT value FROM app_settings WHERE key='events.featured_ids' LIMIT 1");
  const featuredIds: string[] = fr.rows?.[0]?.value || [];
  const nextFeatured = new Set(featuredIds);
  if (featured) nextFeatured.add(id); else nextFeatured.delete(id);
  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ('events.featured_ids', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(Array.from(nextFeatured))]
  );

  // additional categories map in app_settings
  const er = await pool.query("SELECT value FROM app_settings WHERE key='events.extra_categories' LIMIT 1");
  const extraMap: Record<string, string[]> = er.rows?.[0]?.value || {};
  extraMap[id] = extraCategoryIds;
  await pool.query(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ('events.extra_categories', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(extraMap)]
  );

  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
  revalidatePath('/sv/events');
  revalidatePath('/en/events');
}

async function deleteEvent(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const locale = String(formData.get('locale'));
  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
  redirect(`/${locale}/admin/events`);
}

function toLocalInput(d: Date | null | undefined) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 16);
}

export default async function EventDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Evenemang hittades inte' : 'Event not found'}</h1></div>;

  const cats = await db.select().from(eventCategories).orderBy(eventCategories.nameSv);

  const { rows: venueRows } = await pool.query('SELECT id, name FROM venues ORDER BY name');
  const { rows: orgRows } = await pool.query('SELECT id, name FROM organizers ORDER BY name');
  const { rows: eventExtraRows } = await pool.query('SELECT venue_id, organizer_id, member_included FROM events WHERE id = $1 LIMIT 1', [id]);
  const eventExtra = eventExtraRows[0] || {};

  const { rows: defaultsRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.member_included_default_categories' LIMIT 1");
  const defaultCategorySlugs: string[] = defaultsRows?.[0]?.value || [];
  const { rows: featuredRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.featured_ids' LIMIT 1");
  const featuredIds: string[] = featuredRows?.[0]?.value || [];
  const { rows: extraRows } = await pool.query("SELECT value FROM app_settings WHERE key='events.extra_categories' LIMIT 1");
  const extraMap: Record<string, string[]> = extraRows?.[0]?.value || {};
  const selectedExtra = extraMap[id] || [];
  const currentCategory = cats.find((c: any) => c.id === event.categoryId);
  const categoryDefaultOn = currentCategory?.slug ? defaultCategorySlugs.includes(currentCategory.slug) : false;

  const tickets = await db.select().from(ticketTypes).where(eq(ticketTypes.eventId, id));
  const registrations = await db.select({ id: eventRegistrations.id, attendeeName: eventRegistrations.attendeeName, attendeeEmail: eventRegistrations.attendeeEmail, createdAt: eventRegistrations.createdAt }).from(eventRegistrations).where(eq(eventRegistrations.eventId, id)).orderBy(desc(eventRegistrations.createdAt)).limit(50);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline inline-block">&larr; {sv ? 'Alla evenemang' : 'All events'}</a>
      <h1 className="text-2xl font-bold text-gray-900">{sv ? event.titleSv : event.titleEn}</h1>

      <form action={updateEvent} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input type="hidden" name="id" value={event.id} />
        <div className="grid md:grid-cols-2 gap-4">
          <input name="titleSv" defaultValue={event.titleSv} required className="w-full border rounded-lg px-3 py-2" />
          <input name="titleEn" defaultValue={event.titleEn} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(event.startsAt)} required className="w-full border rounded-lg px-3 py-2" />
          <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(event.endsAt)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <select name="categoryId" defaultValue={event.categoryId || ''} className="w-full border rounded-lg px-3 py-2">
            <option value="">{sv ? '— Ingen kategori —' : '— No category —'}</option>
            {cats.map((c: any) => <option key={c.id} value={c.id}>{sv ? c.nameSv : c.nameEn}</option>)}
          </select>
          <select name="venueId" defaultValue={eventExtra.venue_id || ''} className="w-full border rounded-lg px-3 py-2">
            <option value="">{sv ? '— Ingen sparad plats —' : '— No saved venue —'}</option>
            {venueRows.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select name="organizerId" defaultValue={eventExtra.organizer_id || ''} className="w-full border rounded-lg px-3 py-2">
            <option value="">{sv ? '— Ingen arrangör —' : '— No organizer —'}</option>
            {orgRows.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">{sv ? 'Extra kategorier (valfritt)' : 'Extra categories (optional)'}</label>
          <select name="extraCategoryIds" multiple defaultValue={selectedExtra} className="w-full border rounded-lg px-3 py-2 min-h-[120px]">{cats.map((c: any) => <option key={c.id} value={c.id}>{sv ? c.nameSv : c.nameEn}</option>)}</select>
        </div>
        <input name="venue" defaultValue={event.venue || ''} placeholder={sv ? 'Plats' : 'Venue'} className="w-full border rounded-lg px-3 py-2" />
        <input name="venueAddress" defaultValue={event.venueAddress || ''} placeholder={sv ? 'Adress' : 'Address'} className="w-full border rounded-lg px-3 py-2" />
        <input name="featuredImageUrl" defaultValue={event.featuredImageUrl || ''} placeholder="Image URL" className="w-full border rounded-lg px-3 py-2" />
        <textarea name="descriptionSv" rows={5} defaultValue={event.descriptionSv || ''} className="w-full border rounded-lg px-3 py-2" />
        <textarea name="descriptionEn" rows={5} defaultValue={event.descriptionEn || ''} className="w-full border rounded-lg px-3 py-2" />
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="isOnline" defaultChecked={event.isOnline} /> {sv ? 'Online-evenemang' : 'Online event'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={event.published} /> {sv ? 'Publicerad' : 'Published'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="memberIncluded" defaultChecked={Boolean(eventExtra.member_included) || (!eventExtra.member_included && categoryDefaultOn)} /> {sv ? 'Gratis för berättigade medlemmar' : 'Free for eligible members'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featuredEvent" defaultChecked={featuredIds.includes(id)} /> {sv ? 'Utvalt event' : 'Featured event'}</label>
          <a className="text-xs text-blue-600 hover:underline" href={`/${locale}/admin/events/settings`}>{sv ? 'Hantera standardkategorier + utvalda event' : 'Manage default categories + featured events'}</a>
        </div>
        <div className="flex justify-between pt-4 border-t">
          <button type="submit" className="px-6 py-2 bg-[#58595b] text-white rounded-lg">{sv ? 'Spara ändringar' : 'Save changes'}</button>
          <button formAction={deleteEvent} className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm">
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="locale" value={locale} />
            {sv ? 'Ta bort evenemang' : 'Delete event'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
        {sv ? 'Biljetter' : 'Tickets'}: {tickets.length} · {sv ? 'Registreringar' : 'Registrations'}: {registrations.length}
      </div>
    </div>
  );
}
