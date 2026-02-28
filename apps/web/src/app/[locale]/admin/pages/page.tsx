import { createDb, pages } from '@yeshe/db';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function createPage(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const locale = String(formData.get('locale') || 'sv');
  const slug = String(formData.get('slug') || '').trim().replace(/^\/+|\/+$/g, '');
  const titleSv = String(formData.get('titleSv') || '').trim();
  const titleEn = String(formData.get('titleEn') || titleSv).trim();
  if (!slug || !titleSv) return;
  const existing = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).limit(1);
  if (existing.length) return;
  await db.insert(pages).values({ slug, titleSv, titleEn, published: false });
  revalidatePath(`/${locale}/admin/pages`);
}

export default async function AdminPages({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  const rows = await db.select().from(pages).orderBy(desc(pages.updatedAt));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{sv ? 'Sidor' : 'Pages'}</h1>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Ny sida' : 'New page'}</h2>
        <form action={createPage} className="grid md:grid-cols-4 gap-2">
          <input type="hidden" name="locale" value={locale} />
          <input name="slug" placeholder="slug" className="border rounded px-3 py-2" required />
          <input name="titleSv" placeholder="Titel (SV)" className="border rounded px-3 py-2" required />
          <input name="titleEn" placeholder="Title (EN)" className="border rounded px-3 py-2" />
          <button className="px-3 py-2 rounded bg-[#58595b] text-white">+ {sv ? 'Skapa' : 'Create'}</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">{sv ? 'Titel' : 'Title'}</th>
            <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Slug</th>
            <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-sm font-medium">{sv ? p.titleSv : p.titleEn}</td>
                <td className="px-4 py-3 text-sm text-gray-500">/{p.slug}</td>
                <td className="px-4 py-3 text-sm">{p.published ? <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">published</span> : <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">draft</span>}</td>
                <td className="px-4 py-3 text-right"><a className="text-blue-600 hover:underline text-sm" href={`/${locale}/admin/pages/${p.id}`}>{sv ? 'Redigera' : 'Edit'}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
