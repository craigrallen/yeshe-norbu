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
  if (!p) return <div className="p-6">not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <a href={`/${locale}/admin/pages`} className="text-blue-600 hover:underline text-sm">&larr; {sv ? 'Alla sidor' : 'All pages'}</a>
      <form action={savePage} className="bg-white rounded-xl border p-6 space-y-3">
        <input type="hidden" name="id" value={p.id} />
        <input type="hidden" name="locale" value={locale} />
        <div className="grid md:grid-cols-3 gap-2">
          <input name="slug" defaultValue={p.slug} className="border rounded px-3 py-2" />
          <input name="titleSv" defaultValue={p.titleSv} className="border rounded px-3 py-2" />
          <input name="titleEn" defaultValue={p.titleEn} className="border rounded px-3 py-2" />
        </div>
        <textarea name="contentSv" defaultValue={p.contentSv || ''} rows={12} className="w-full border rounded px-3 py-2" />
        <textarea name="contentEn" defaultValue={p.contentEn || ''} rows={12} className="w-full border rounded px-3 py-2" />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={p.published} /> {sv ? 'Publicerad' : 'Published'}</label>
        <div className="flex justify-between">
          <button className="px-4 py-2 rounded bg-[#58595b] text-white">{sv ? 'Spara' : 'Save'}</button>
          <button formAction={deletePage} className="px-4 py-2 rounded border border-red-200 text-red-600">{sv ? 'Ta bort' : 'Delete'}</button>
        </div>
      </form>
    </div>
  );
}
