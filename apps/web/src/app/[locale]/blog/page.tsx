import type { Metadata } from 'next';
import { Pool } from 'pg';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const sv = locale === 'sv';
  return {
    title: sv ? 'Blogg' : 'Blog',
    description: sv
      ? 'Nyheter, reflektioner och inspiration från Yeshin Norbu Meditationscenter i Stockholm.'
      : 'News, reflections and inspiration from Yeshin Norbu Meditation Centre in Stockholm.',
  };
}

export default async function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  let posts: any[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.slug, p.title_sv, p.title_en, p.excerpt_sv, p.excerpt_en,
              p.featured_image_url, p.published_at, p.created_at,
              u.first_name, u.last_name
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.published = true
       ORDER BY COALESCE(p.published_at, p.created_at) DESC
       LIMIT 50`
    );
    posts = rows;
  } catch (e) {
    posts = [];
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero
        title={sv ? 'Blogg' : 'Blog'}
        subtitle={sv ? 'Artiklar om meditation, mindfulness, buddhistisk filosofi och praktik.' : 'Articles on meditation, mindfulness, Buddhist philosophy and practice.'}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-10">{sv ? 'Inga inlägg ännu.' : 'No posts yet.'}</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => {
              const title = sv ? p.title_sv : (p.title_en || p.title_sv);
              const excerpt = sv ? p.excerpt_sv : (p.excerpt_en || p.excerpt_sv);
              const date = p.published_at || p.created_at;
              const author = p.first_name ? `${p.first_name} ${p.last_name}` : null;
              return (
                <Link key={p.slug} href={`/${locale}/blog/${p.slug}`} className="group">
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    {p.featured_image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img src={p.featured_image_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl">🪷</div>
                    )}
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        {author && <span>{author}</span>}
                        {date && <span>{new Date(date).toLocaleDateString(sv ? 'sv-SE' : 'en-GB')}</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-[#E8B817] transition-colors">{title}</h3>
                      {excerpt && <p className="text-sm text-gray-600 leading-relaxed flex-1">{excerpt}</p>}
                      <div className="pt-2">
                        <span className="text-[#E8B817] text-sm font-medium group-hover:underline">{sv ? 'Läs mer' : 'Read more'} →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
