import { notFound } from 'next/navigation';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Map slug to MDX file - parse frontmatter manually
function getPost(slug: string) {
  const basePath = join(process.cwd(), 'src/content/blog');
  const filePath = join(basePath, `${slug}.mdx`);
  if (!existsSync(filePath)) return null;

  const raw = readFileSync(filePath, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;

  const fm: Record<string, string> = {};
  fmMatch[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && v.length) fm[k.trim()] = v.join(':').trim().replace(/^'|'$/g, '').replace(/^"|"$/g, '');
  });

  const body = fmMatch[2];
  // Split on the --- divider between Swedish and English
  const [svContent, enContent] = body.split('\n---\n');

  return { ...fm, slug, svContent: svContent?.trim() || '', enContent: enContent?.trim() || '' };
}

// Simple markdown-to-html (headings, bold, lists, paragraphs)
function renderMd(md: string) {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium text-gray-900 mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul class="list-disc space-y-1 my-3 pl-4">${m}</ul>`)
    .replace(/^(?!<[h|u|l])\S(.+)$/gm, '<p class="text-gray-700 leading-relaxed mb-4">$&</p>');
}

export default function BlogPost({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const post = getPost(slug);
  if (!post) notFound();

  const sv = locale === 'sv';
  const title = sv ? post.title : (post.titleEn || post.title);
  const content = sv ? post.svContent : (post.enContent || post.svContent);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <a href={`/${locale}/blog`} className="hover:text-gray-900">{sv ? '← Tillbaka till bloggen' : '← Back to blog'}</a>
          <span>·</span>
          <span>{post.date}</span>
          {post.category && (
            <>
              <span>·</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{post.category}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600">{sv ? post.excerpt : (post.excerptEn || post.excerpt)}</p>
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMd(content) }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-4">{sv ? 'Dela den här artikeln:' : 'Share this article:'}</p>
        <div className="flex gap-3">
          <a href={`/${locale}/blog`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            {sv ? '← Fler artiklar' : '← More articles'}
          </a>
          <a href={`/${locale}/events`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            {sv ? 'Se kommande evenemang' : 'See upcoming events'}
          </a>
        </div>
      </div>
    </article>
  );
}
