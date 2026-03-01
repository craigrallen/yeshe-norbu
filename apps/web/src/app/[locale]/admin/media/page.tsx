import { createDb, media } from '@yeshe/db';
import { desc, sql, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

const PAGE_SIZE = 48;

async function uploadMedia(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return;

  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const body = new FormData();
  body.append('file', file);
  body.append('altTextSv', String(formData.get('altTextSv') || ''));
  body.append('altTextEn', String(formData.get('altTextEn') || ''));

  await fetch(`${apiUrl}/api/admin/media`, { method: 'POST', body });
  revalidatePath(`/${locale}/admin/media`);
}

async function deleteMedia(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'sv');
  await requireAdmin(locale);
  const id = String(formData.get('id'));
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  await fetch(`${apiUrl}/api/admin/media`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  revalidatePath(`/${locale}/admin/media`);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MediaLibraryPage({
  params: { locale }, searchParams,
}: { params: { locale: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const page = Number(searchParams?.page || '1');
  const typeFilter = String(searchParams?.type || '');
  const search = String(searchParams?.q || '');
  const offset = (page - 1) * PAGE_SIZE;

  let where = sql`1=1`;
  if (typeFilter) where = sql`${media.type} = ${typeFilter}`;
  if (search) where = sql`${where} AND (${media.filename} ILIKE ${'%' + search + '%'} OR ${media.altTextSv} ILIKE ${'%' + search + '%'} OR ${media.altTextEn} ILIKE ${'%' + search + '%'})`;

  const [items, countResult] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(media).where(where),
  ]);
  const total = countResult[0]?.count || 0;
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{sv ? 'Mediabibliotek' : 'Media Library'}</h1>
          <p className="text-sm text-gray-500">{total} {sv ? 'filer' : 'files'}</p>
        </div>
      </div>

      {/* Upload area */}
      <form action={uploadMedia} className="bg-white rounded-xl border p-6">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">{sv ? 'Välj fil' : 'Choose file'}</label>
            <input name="file" type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="w-full text-sm border rounded px-3 py-2" required />
            <p className="text-xs text-gray-400 mt-1">{sv ? 'Bilder optimeras automatiskt till WebP (max 1920px, 80% kvalitet) för bästa PageSpeed.' : 'Images auto-optimized to WebP (max 1920px, 80% quality) for best PageSpeed.'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Alt text (SV)</label>
            <input name="altTextSv" className="w-full text-sm border rounded px-3 py-2" placeholder="Beskrivning..." />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">Alt text (EN)</label>
              <input name="altTextEn" className="w-full text-sm border rounded px-3 py-2" placeholder="Description..." />
            </div>
            <button className="self-end px-5 py-2 rounded-lg bg-[#E8B817] text-[#3D3D3D] font-bold text-sm whitespace-nowrap">{sv ? 'Ladda upp' : 'Upload'}</button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <form method="get" className="flex gap-2 items-center">
          <input name="q" defaultValue={search} placeholder={sv ? 'Sök media...' : 'Search media...'} className="text-sm border rounded px-3 py-2 w-56" />
          <select name="type" defaultValue={typeFilter} className="text-sm border rounded px-3 py-2">
            <option value="">{sv ? 'Alla typer' : 'All types'}</option>
            <option value="image">{sv ? 'Bilder' : 'Images'}</option>
            <option value="video">Video</option>
            <option value="document">{sv ? 'Dokument' : 'Documents'}</option>
          </select>
          <button className="px-4 py-2 rounded-lg border text-sm">{sv ? 'Filtrera' : 'Filter'}</button>
        </form>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          {sv ? 'Inga mediafiler hittades.' : 'No media files found.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border overflow-hidden group relative">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={sv ? item.altTextSv : item.altTextEn} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="text-3xl text-gray-300">
                    {item.type === 'video' ? '🎥' : '📄'}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-700 truncate font-medium">{item.filename}</p>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>{formatBytes(item.sizeBytes || 0)}</span>
                  <span>{item.mimeType}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <button onClick={`navigator.clipboard.writeText('${item.url}')`} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200" title="Copy URL">📋 URL</a>
                  <form action={deleteMedia} className="inline">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={item.id} />
                    <button className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100">🗑️</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`/${locale}/admin/media?page=${p}${typeFilter ? '&type=' + typeFilter : ''}${search ? '&q=' + search : ''}`}
              className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-[#3D3D3D] text-[#E8B817] font-bold' : 'border hover:bg-gray-50'}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
