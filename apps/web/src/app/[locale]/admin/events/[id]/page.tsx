import { createDb, events, eventCategories, ticketTypes, eventRegistrations } from '@yeshe/db';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/authz';

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

  if (!titleSv || !startsAt) return;

  await db.update(events).set({
    titleSv, titleEn: titleEn || titleSv,
    descriptionSv: descSv || null, descriptionEn: descEn || null,
    startsAt: new Date(startsAt),
    endsAt: endsAt ? new Date(endsAt) : null,
    venue: venue || null, venueAddress: venueAddress || null,
    isOnline, published,
    featuredImageUrl: featuredImageUrl || null,
    updatedAt: new Date(),
  }).where(eq(events.id, id));

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
  const dt = new Date(d);
  return dt.toISOString().slice(0, 16);
}

export default async function EventDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Evenemang hittades inte' : 'Event not found'}</h1></div>;

  const cats = await db.select().from(eventCategories).orderBy(eventCategories.nameSv);
  
  const tickets = await db.select().from(ticketTypes).where(eq(ticketTypes.eventId, id));
  
  const registrations = await db
    .select({
      id: eventRegistrations.id,
      attendeeName: eventRegistrations.attendeeName,
      attendeeEmail: eventRegistrations.attendeeEmail,
      checkedInAt: eventRegistrations.checkedInAt,
      createdAt: eventRegistrations.createdAt,
    })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, id))
    .orderBy(desc(eventRegistrations.createdAt))
    .limit(100);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; {sv ? 'Alla evenemang' : 'All events'}</a>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? event.titleSv : event.titleEn}</h1>
          <p className="text-sm text-gray-400">ID: {event.id} &middot; Slug: /{event.slug}</p>
        </div>
        <span className={"px-3 py-1 text-sm rounded-full font-medium " + (event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
          {event.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
        </span>
      </div>

      <form action={updateEvent} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <input type="hidden" name="id" value={event.id} />
        <h2 className="font-semibold text-lg">{sv ? 'Redigera evenemang' : 'Edit event'}</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Titel (SV)' : 'Title (SV)'}</label>
            <input name="titleSv" defaultValue={event.titleSv} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Titel (EN)' : 'Title (EN)'}</label>
            <input name="titleEn" defaultValue={event.titleEn} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Startar' : 'Starts at'}</label>
            <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(event.startsAt)} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Slutar' : 'Ends at'}</label>
            <input name="endsAt" type="datetime-local" defaultValue={toLocalInput(event.endsAt)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Plats' : 'Venue'}</label>
            <input name="venue" defaultValue={event.venue || ''} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Adress' : 'Address'}</label>
            <input name="venueAddress" defaultValue={event.venueAddress || ''} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Bild-URL' : 'Featured image URL'}</label>
          <input name="featuredImageUrl" defaultValue={event.featuredImageUrl || ''} className="w-full border rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Beskrivning (SV)' : 'Description (SV)'}</label>
          <textarea name="descriptionSv" rows={6} defaultValue={event.descriptionSv || ''} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Beskrivning (EN)' : 'Description (EN)'}</label>
          <textarea name="descriptionEn" rows={6} defaultValue={event.descriptionEn || ''} className="w-full border rounded-lg px-3 py-2" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isOnline" defaultChecked={event.isOnline} className="rounded" />
            <span className="text-sm">{sv ? 'Online-evenemang' : 'Online event'}</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={event.published} className="rounded" />
            <span className="text-sm">{sv ? 'Publicerad' : 'Published'}</span>
          </label>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button type="submit" className="px-6 py-2 bg-[#58595b] text-white rounded-lg hover:bg-[#6b6c6e] font-medium">
            {sv ? 'Spara ändringar' : 'Save changes'}
          </button>
          <form action={deleteEvent}>
            <input type="hidden" name="id" value={event.id} />
            <input type="hidden" name="locale" value={locale} />
            <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm">
              {sv ? 'Ta bort evenemang' : 'Delete event'}
            </button>
          </form>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Biljetttyper' : 'Ticket types'} ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga biljetttyper definierade' : 'No ticket types defined'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Namn' : 'Name'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Pris' : 'Price'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Kapacitet' : 'Capacity'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Sålda' : 'Sold'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tickets.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-2 text-sm">{sv ? t.nameSv : t.nameEn}</td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(t.priceSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{t.capacity || '\u221e'}</td>
                  <td className="px-4 py-2 text-sm">{t.soldCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Registreringar / Deltagare' : 'Registrations / Attendees'} ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga registreringar' : 'No registrations'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Namn' : 'Name'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'E-post' : 'Email'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Incheckad' : 'Checked in'}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Registrerad' : 'Registered'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{r.attendeeName}</td>
                  <td className="px-4 py-2 text-sm">{r.attendeeEmail}</td>
                  <td className="px-4 py-2 text-sm">{r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('sv-SE') : '\u2014'}</td>
                  <td className="px-4 py-2 text-sm">{new Date(r.createdAt).toLocaleString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-400">
        {sv ? 'Skapad' : 'Created'}: {new Date(event.createdAt).toLocaleString('sv-SE')} &middot; {sv ? 'Uppdaterad' : 'Updated'}: {new Date(event.updatedAt).toLocaleString('sv-SE')}
      </div>
    </div>
  );
}
