import { createDb, pages } from '@yeshe/db';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function CmsPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  const [p] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.published, true))).limit(1);
  if (!p) notFound();

  const title = sv ? p.titleSv : p.titleEn;
  const content = (sv ? p.contentSv : p.contentEn) || '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#58595b] mb-6">{title}</h1>
      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
    </div>
  );
}
