import type { Metadata } from 'next';
import { Pool } from 'pg';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getPost(slug: string) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.first_name, u.last_name
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.slug = $1 AND p.published = true
       LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const sv = locale === 'sv';
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };
  const title = sv ? post.title_sv : (post.title_en || post.title_sv);
  const desc = sv ? post.excerpt_sv : (post.excerpt_en || post.excerpt_sv);
  return {
    title,
    description: desc,
    openGraph: post.featured_image_url ? { images: [post.featured_image_url] } : undefined,
  };
}

function renderMd(md: string) {
  if (!md) return '';
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium text-gray-900 mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul class="list-disc space-y-1 my-3 pl-4">${m}</ul>`)
    .replace(/^(?!<[hul])[^\n].+$/gm, '<p class="text-gray-700 leading-relaxed mb-4">$&</p>');
}

export default async function BlogPost({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const sv = locale === 'sv';
  const post = await getPost(slug);
  if (!post) notFound();

  const title = sv ? post.title_sv : (post.title_en || post.title_sv);
  const excerpt = sv ? post.excerpt_sv : (post.excerpt_en || post.excerpt_sv);
  const content = sv ? post.content_sv : (post.content_en || post.content_sv);
  const author = post.first_name ? `${post.first_name} ${post.last_name}` : null;
  const date = post.published_at || post.created_at;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <Link href={`/${locale}/blog`} className="hover:text-gray-900">
            {sv ? '← Tillbaka till bloggen' : '← Back to blog'}
          </Link>
          {date && (
            <>
              <span>·</span>
              <span>{new Date(date).toLocaleDateString(sv ? 'sv-SE' : 'en-GB')}</span>
            </>
          )}
          {author && (
            <>
              <span>·</span>
              <span>{author}</span>
            </>
          )}
        </div>

        {post.featured_image_url && (
          <div className="rounded-xl overflow-hidden mb-6 aspect-video">
            <img src={post.featured_image_url} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        {excerpt && <p className="text-lg text-gray-600">{excerpt}</p>}
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMd(content || '') }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex gap-3">
          <Link href={`/${locale}/blog`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            {sv ? '← Fler artiklar' : '← More articles'}
          </Link>
          <Link href={`/${locale}/events`} className="px-4 py-2 bg-[#E8B817] text-white rounded-lg text-sm hover:opacity-90">
            {sv ? 'Se kommande evenemang' : 'See upcoming events'}
          </Link>
        </div>
      </div>
    </article>
  );
}
