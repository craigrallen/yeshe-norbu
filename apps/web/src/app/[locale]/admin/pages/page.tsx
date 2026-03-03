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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sv ? 'Sidor' : 'Pages'}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{rows.length} {sv ? 'sidor' : 'pages'}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{sv ? 'Ny sida' : 'New page'}</h2>
        <form action={createPage} className="grid md:grid-cols-4 gap-2">
          <input type="hidden" name="locale" value={locale} />
          <input name="slug" placeholder="slug" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" required />
          <input name="titleSv" placeholder="Titel (SV)" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" required />
          <input name="titleEn" placeholder="Title (EN)" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" />
          <button className="px-3 py-2 rounded bg-[#E8B817] hover:bg-[#d4a815] text-white text-sm font-medium">+ {sv ? 'Skapa' : 'Create'}</button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700"><tr>
            <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Titel' : 'Title'}</th>
            <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Slug</th>
            <th className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">{sv ? 'Inga sidor skapade ännu' : 'No pages created yet'}</td></tr>
            ) : rows.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{sv ? p.titleSv : p.titleEn}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">/{p.slug}</td>
                <td className="px-4 py-3 text-sm">{p.published ? <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs">published</span> : <span className="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs">draft</span>}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  {p.published && <a className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm" href={`/${locale}/${p.slug}`} target="_blank">↗ {sv ? 'Visa' : 'View'}</a>}
                  <a className="text-blue-600 dark:text-blue-400 hover:underline text-sm" href={`/${locale}/admin/pages/${p.id}`}>{sv ? 'Redigera' : 'Edit'}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
