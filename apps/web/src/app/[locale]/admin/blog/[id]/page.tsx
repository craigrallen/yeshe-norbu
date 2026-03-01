import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { BlogPostForm } from '@/components/admin-blog-form';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function EditBlogPost({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  let post: any = null;
  try {
    const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1 LIMIT 1', [id]);
    post = rows[0] || null;
  } catch {}

  if (!post) notFound();

  async function savePost(formData: FormData) {
    'use server';
    await requireAdmin(locale);

    const slug = (formData.get('slug') as string).trim().toLowerCase();
    const titleSv = (formData.get('title_sv') as string).trim();
    const titleEn = (formData.get('title_en') as string || '').trim();
    const excerptSv = formData.get('excerpt_sv') as string || '';
    const excerptEn = formData.get('excerpt_en') as string || '';
    const contentSv = formData.get('content_sv') as string || '';
    const contentEn = formData.get('content_en') as string || '';
    const featuredImageUrl = formData.get('featured_image_url') as string || '';
    const published = formData.get('published') === 'true';

    await pool.query(
      `UPDATE posts SET slug=$1, title_sv=$2, title_en=$3, excerpt_sv=$4, excerpt_en=$5,
       content_sv=$6, content_en=$7, featured_image_url=$8, published=$9,
       published_at = CASE WHEN $9 AND published_at IS NULL THEN now() ELSE published_at END,
       updated_at = now()
       WHERE id = $10`,
      [slug, titleSv, titleEn || titleSv, excerptSv, excerptEn, contentSv, contentEn, featuredImageUrl || null, published, id]
    );

    revalidatePath(`/sv/blog`);
    revalidatePath(`/en/blog`);
    revalidatePath(`/sv/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
    redirect(`/${locale}/admin/blog`);
  }

  async function deletePost(formData: FormData) {
    'use server';
    await requireAdmin(locale);
    const postId = formData.get('id') as string;
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    revalidatePath(`/sv/blog`);
    revalidatePath(`/en/blog`);
    redirect(`/${locale}/admin/blog`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/${locale}/admin/blog`} className="text-sm text-[#E8B817] hover:underline">&larr; {sv ? 'Tillbaka' : 'Back'}</a>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Redigera inlägg' : 'Edit post'}</h1>
      </div>
      <BlogPostForm locale={locale} post={post} action={savePost} deleteAction={deletePost} />
    </div>
  );
}
