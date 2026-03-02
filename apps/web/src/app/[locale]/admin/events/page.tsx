import { createDb, events, eventCategories } from '@yeshe/db';
import { Pool } from 'pg';
import { EventsBulkActions } from './EventsBulkActions';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

async function createEvent(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);

  const titleSv = String(formData.get('titleSv') || '').trim();
  const titleEn = String(formData.get('titleEn') || titleSv).trim();
  const startsAt = String(formData.get('startsAt') || '').trim();
  const venue = String(formData.get('venue') || '').trim();

  if (!titleSv || !startsAt) return;

  const baseSlug = slugify(titleSv);
  let slug = baseSlug || `event-${Date.now()}`;

  const existing = await db.select({ slug: events.slug }).from(events).where(eq(events.slug, slug)).limit(1);
  if (existing.length) slug = `${slug}-${Date.now().toString().slice(-6)}`;

  await db.insert(events).values({ slug, titleSv, titleEn, startsAt: new Date(startsAt), venue: venue || null, published: false });

  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
}

async function togglePublish(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id') || '');
  const next = String(formData.get('next') || 'false') === 'true';
  if (!id) return;

  await db.update(events).set({ published: next, updatedAt: new Date() }).where(eq(events.id, id));
  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
  revalidatePath('/sv/events');
  revalidatePath('/en/events');
}

async function deleteEvent(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id') || '');
  if (!id) return;
  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
}


async function bulkDelete(formData: FormData) {
  'use server';
  const ids = formData.getAll('ids').map(String).filter(Boolean);
  if (!ids.length) return;
  await pool.query(`DELETE FROM events WHERE id = ANY($1::uuid[])`, [ids]);
  revalidatePath('/sv/admin/events');
  revalidatePath('/en/admin/events');
}

export default async function AdminEvents({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);

  const rows = await db
    .select({
      id: events.id,
      slug: events.slug,
      titleSv: events.titleSv,
      titleEn: events.titleEn,
      startsAt: events.startsAt,
      venue: events.venue,
      published: events.published,
      categoryNameSv: eventCategories.nameSv,
      categoryNameEn: eventCategories.nameEn,
    })
    .from(events)
    .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
    .orderBy(desc(events.startsAt))
    .limit(300);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Evenemang' : 'Events'}</h1>
        <p className="text-gray-500 text-sm mt-1">{rows.length} {sv ? 'evenemang i databasen' : 'events in database'}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Nytt evenemang' : 'New event'}</h2>
        <form action={createEvent} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <input name="titleSv" required placeholder={sv ? 'Titel (SV)' : 'Title (SV)'} className="border rounded-lg px-3 py-2 lg:col-span-3 min-w-0" />
          <input name="titleEn" placeholder={sv ? 'Titel (EN)' : 'Title (EN)'} className="border rounded-lg px-3 py-2 lg:col-span-3 min-w-0" />
          <input name="startsAt" type="datetime-local" required className="border rounded-lg px-3 py-2 lg:col-span-3 min-w-0" />
          <input name="venue" placeholder={sv ? 'Plats' : 'Venue'} className="border rounded-lg px-3 py-2 lg:col-span-2 min-w-0" />
          <button className="px-4 py-2 bg-[#58595b] text-white rounded-lg hover:bg-[#6b6c6e] font-medium whitespace-nowrap lg:col-span-1 w-full lg:w-auto">+ {sv ? 'Skapa' : 'Create'}</button>
        </form>
      </div>

      <EventsBulkActions rows={rows} locale={locale} sv={sv} togglePublish={togglePublish} deleteEvent={deleteEvent} bulkDelete={bulkDelete} />

    </div>
  );
}
