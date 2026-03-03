import { createDb, pages } from '@yeshe/db';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';
import { redirect } from 'next/navigation';

async function savePage(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const locale = String(formData.get('locale') || 'sv');
  const slug = String(formData.get('slug') || '').trim().replace(/^\/+|\/+$/g, '');
  const titleSv = String(formData.get('titleSv') || '').trim();
  const titleEn = String(formData.get('titleEn') || '').trim();
  const contentSv = String(formData.get('contentSv') || '');
  const contentEn = String(formData.get('contentEn') || '');
  const published = formData.get('published') === 'on';
  await db.update(pages).set({ slug, titleSv, titleEn, contentSv, contentEn, published, updatedAt: new Date() }).where(eq(pages.id, id));
  revalidatePath(`/${locale}/${slug}`);
  revalidatePath(`/${locale}/admin/pages`);
  revalidatePath(`/${locale}/admin/pages/${id}`);
}

async function deletePage(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const locale = String(formData.get('locale') || 'sv');
  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath(`/${locale}/admin/pages`);
  redirect(`/${locale}/admin/pages`);
}

export default async function PageEdit({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);
  const [p] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!p) return <div className="p-6 text-gray-500">Page not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <a href={`/${locale}/admin/pages`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; {sv ? 'Alla sidor' : 'All pages'}</a>
        {p.published && <a href={`/${locale}/${p.slug}`} target="_blank" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">↗ {sv ? 'Visa på sajten' : 'View on site'}</a>}
      </div>
      <form action={savePage} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <input type="hidden" name="locale" value={locale} />
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Slug</label>
            <input name="slug" defaultValue={p.slug} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Titel (SV)</label>
            <input name="titleSv" defaultValue={p.titleSv} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Title (EN)</label>
            <input name="titleEn" defaultValue={p.titleEn} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{sv ? 'Innehåll (SV)' : 'Content (SV)'} — HTML</label>
          <textarea name="contentSv" defaultValue={p.contentSv || ''} rows={14} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{sv ? 'Innehåll (EN)' : 'Content (EN)'} — HTML</label>
          <textarea name="contentEn" defaultValue={p.contentEn || ''} rows={14} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm font-mono" />
        </div>
        <label className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"><input type="checkbox" name="published" defaultChecked={p.published} className="rounded" /> {sv ? 'Publicerad' : 'Published'}</label>
        <div className="flex justify-between pt-2">
          <button className="px-4 py-2 rounded bg-[#E8B817] hover:bg-[#d4a815] text-white text-sm font-medium">{sv ? 'Spara' : 'Save'}</button>
          <button formAction={deletePage} className="px-4 py-2 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20">{sv ? 'Ta bort' : 'Delete'}</button>
        </div>
      </form>
    </div>
  );
}
