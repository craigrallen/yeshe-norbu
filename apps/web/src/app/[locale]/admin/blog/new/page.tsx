import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { BlogPostForm } from '@/components/admin-blog-form';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function NewBlogPost({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const session = await requireAdmin(locale);

  async function createPost(formData: FormData) {
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

    const { rows } = await pool.query(
      `INSERT INTO posts (slug, title_sv, title_en, excerpt_sv, excerpt_en, content_sv, content_en, featured_image_url, author_id, published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [slug, titleSv, titleEn || titleSv, excerptSv, excerptEn, contentSv, contentEn, featuredImageUrl || null, session.userId, published, published ? new Date() : null]
    );

    revalidatePath(`/sv/blog`);
    revalidatePath(`/en/blog`);
    redirect(`/${locale}/admin/blog/${rows[0].id}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <a href={`/${locale}/admin/blog`} className="text-sm text-[#E8B817] hover:underline">&larr; {sv ? 'Tillbaka' : 'Back'}</a>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Nytt blogginlägg' : 'New blog post'}</h1>
      </div>
      <BlogPostForm locale={locale} action={createPost} />
    </div>
  );
}
