import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { BlogBulkActions } from './BlogBulkActions';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function bulkDelete(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  const ids = formData.getAll('ids').map(String).filter(Boolean);
  if (!ids.length) return;
  await pool.query(`DELETE FROM posts WHERE id = ANY($1::uuid[])`, [ids]);
  revalidatePath(`/${locale}/admin/blog`);
}

async function bulkPublish(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  const ids = formData.getAll('ids').map(String).filter(Boolean);
  const state = String(formData.get('publishState') || 'true') === 'true';
  if (!ids.length) return;
  await pool.query(`UPDATE posts SET published = $1, published_at = CASE WHEN $1 THEN now() ELSE published_at END WHERE id = ANY($2::uuid[])`, [state, ids]);
  revalidatePath(`/${locale}/admin/blog`);
}

export default async function AdminBlogPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  let posts: any[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.slug, p.title_sv, p.title_en, p.published, p.published_at, p.created_at,
              u.first_name, u.last_name
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.created_at DESC`
    );
    posts = rows;
  } catch {}

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sv ? 'Blogg' : 'Blog'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{sv ? 'Hantera blogginlägg' : 'Manage blog posts'}</p>
        </div>
        <Link href={`/${locale}/admin/blog/new`} className="px-4 py-2 bg-[#E8B817] text-white rounded-lg hover:opacity-90 font-medium text-sm">
          + {sv ? 'Nytt inlägg' : 'New post'}
        </Link>
      </div>
      <BlogBulkActions posts={posts} locale={locale} sv={sv} bulkDelete={bulkDelete} bulkPublish={bulkPublish} />
    </div>
  );
}
