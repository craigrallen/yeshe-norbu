import { createDb, events, eventCategories } from '@yeshe/db';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
  const priceSek = String(formData.get('priceSek') || '0').trim();

  if (!titleSv || !startsAt) return;

  const baseSlug = slugify(titleSv);
  let slug = baseSlug || `event-${Date.now()}`;

  const existing = await db.select({ slug: events.slug }).from(events).where(eq(events.slug, slug)).limit(1);
  if (existing.length) slug = `${slug}-${Date.now().toString().slice(-6)}`;

  await db.insert(events).values({
    slug,
    titleSv,
    titleEn,
    startsAt: new Date(startsAt),
    venue: venue || null,
    priceSek: priceSek || '0',
    published: false,
  });

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
      priceSek: events.priceSek,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Evenemang' : 'Events'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sv ? 'Databasdriven eventhantering (skapa/publicera/ta bort)' : 'Database-driven event management (create/publish/delete)'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Nytt evenemang' : 'New event'}</h2>
        <form action={createEvent} className="grid md:grid-cols-5 gap-3">
          <input name="titleSv" required placeholder={sv ? 'Titel (SV)' : 'Title (SV)'} className="border rounded-lg px-3 py-2" />
          <input name="titleEn" placeholder={sv ? 'Titel (EN)' : 'Title (EN)'} className="border rounded-lg px-3 py-2" />
          <input name="startsAt" type="datetime-local" required className="border rounded-lg px-3 py-2" />
          <input name="venue" placeholder={sv ? 'Plats' : 'Venue'} className="border rounded-lg px-3 py-2" />
          <div className="flex gap-2">
            <input name="priceSek" type="number" min="0" step="1" defaultValue="0" className="border rounded-lg px-3 py-2 w-28" />
            <button className="px-4 py-2 bg-[#58595b] text-white rounded-lg hover:bg-[#6b6c6e] font-medium">+ {sv ? 'Skapa' : 'Create'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 text-sm text-gray-500">{rows.length} {sv ? 'evenemang i databasen' : 'events in database'}</div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Titel' : 'Title'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Plats' : 'Venue'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Pris' : 'Price'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-gray-900">{sv ? e.titleSv : e.titleEn}</div>
                  <div className="text-xs text-gray-400">/{e.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.startsAt).toLocaleString('sv-SE')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.venue || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{Math.round(Number(e.priceSek || '0'))} kr</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${e.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {e.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="next" value={(!e.published).toString()} />
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        {e.published ? (sv ? 'Avpublicera' : 'Unpublish') : (sv ? 'Publicera' : 'Publish')}
                      </button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="text-red-600 hover:text-red-800 text-sm">{sv ? 'Ta bort' : 'Delete'}</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
