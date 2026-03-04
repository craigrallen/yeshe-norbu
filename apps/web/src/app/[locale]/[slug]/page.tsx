import { createDb, pages } from '@yeshe/db';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function generateMetadata({ params: { locale, slug } }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  try {
    const { rows } = await pool.query('SELECT title_sv, title_en FROM pages WHERE slug = $1 AND published = true LIMIT 1', [slug]);
    if (!rows[0]) return {};
    const title = locale === 'sv' ? rows[0].title_sv : rows[0].title_en;
    return { title };
  } catch { return {}; }
}

export default async function CmsPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  let p: any;
  try {
    [p] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true))).limit(1);
  } catch {
    notFound();
  }
  if (!p) notFound();

  const title = sv ? p.titleSv : p.titleEn;
  const content = (sv ? p.contentSv : p.contentEn) || '';

  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-[#1A1A1A]">
      <PageHero title={title} />
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <article
          className="prose prose-lg dark:prose-invert max-w-none text-charcoal-light dark:text-[#C0BAB0] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
        />
      </section>
    </div>
  );
}
