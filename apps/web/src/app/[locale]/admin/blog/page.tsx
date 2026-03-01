import { Pool } from 'pg';
import { requireAdmin } from '@/lib/authz';
import Link from 'next/link';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Blogg' : 'Blog'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera blogginlägg' : 'Manage blog posts'}</p>
        </div>
        <Link href={`/${locale}/admin/blog/new`} className="px-4 py-2 bg-[#E8B817] text-white rounded-lg hover:opacity-90 font-medium">
          + {sv ? 'Nytt inlägg' : 'New post'}
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Titel' : 'Title'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((p) => {
              const title = sv ? p.title_sv : (p.title_en || p.title_sv);
              const date = p.published_at || p.created_at;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div>{title}</div>
                    <div className="text-xs text-gray-400">{p.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{date ? new Date(date).toLocaleDateString(sv ? 'sv-SE' : 'en-GB') : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {p.published ? (sv ? 'Publicerad' : 'Published') : (sv ? 'Utkast' : 'Draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex gap-3 justify-end">
                    <Link href={`/${locale}/blog/${p.slug}`} className="text-gray-500 hover:text-gray-900 text-sm">{sv ? 'Visa' : 'View'}</Link>
                    <Link href={`/${locale}/admin/blog/${p.id}`} className="text-[#E8B817] hover:opacity-70 text-sm font-medium">{sv ? 'Redigera' : 'Edit'}</Link>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">{sv ? 'Inga inlägg ännu.' : 'No posts yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
