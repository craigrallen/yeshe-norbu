import { createDb, media } from '@yeshe/db';
import { desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

const PAGE_SIZE = 60;
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function getPublicDir(): string {
  const standalone = path.join(process.cwd(), 'public');
  if (fs.existsSync(standalone)) return standalone;
  const dev = path.join(process.cwd(), 'apps/web/public');
  if (fs.existsSync(dev)) return dev;
  return '';
}

function scanDir(dir: string, baseDir: string, results: any[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      scanDir(fullPath, baseDir, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      const stat = fs.statSync(fullPath);
      const relativePath = '/' + path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({
        id: 'fs:' + relativePath, filename: entry.name, url: relativePath,
        type: 'image', mimeType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : ext === '.gif' ? 'image/gif' : 'image/jpeg',
        sizeBytes: stat.size,
        source: relativePath.startsWith('/wp-media/') ? 'WordPress' : relativePath.startsWith('/seasons/') ? 'Seasonal' : relativePath.startsWith('/brand/') ? 'Brand' : relativePath.startsWith('/uploads/') ? 'Uploads' : 'Other',
        createdAt: stat.mtime.toISOString(),
      });
    }
  }
}

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
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default async function MediaLibraryPage({
  params: { locale }, searchParams,
}: { params: { locale: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  const page = Number(searchParams?.page || '1');
  const sourceFilter = String(searchParams?.source || '');
  const search = String(searchParams?.q || '').toLowerCase();

  // 1. Scan filesystem
  const fsItems: any[] = [];
  const pubDir = getPublicDir();
  if (pubDir) scanDir(pubDir, pubDir, fsItems);

  // 2. Get DB uploads
  const db = createDb(process.env.DATABASE_URL!);
  const dbItems = await db.select().from(media).orderBy(desc(media.createdAt));
  const dbMapped = dbItems.map((item: any) => ({
    id: item.id, filename: item.filename, url: item.url, type: item.type,
    mimeType: item.mimeType, sizeBytes: item.sizeBytes || 0,
    source: 'Uploads', createdAt: item.createdAt?.toISOString?.() || item.createdAt || '',
    isDb: true,
  }));

  // 3. Merge (DB items override filesystem for /uploads/)
  const dbUrls = new Set(dbMapped.map((d: any) => d.url));
  const allItems = [...dbMapped, ...fsItems.filter(f => !dbUrls.has(f.url))];

  // 4. Filter
  let filtered = allItems;
  if (sourceFilter) filtered = filtered.filter(i => i.source === sourceFilter);
  if (search) filtered = filtered.filter(i => i.filename.toLowerCase().includes(search) || i.url.toLowerCase().includes(search));

  // Sort: newest first
  filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Source counts
  const sourceCounts: Record<string, number> = {};
  allItems.forEach(i => { sourceCounts[i.source] = (sourceCounts[i.source] || 0) + 1; });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sv ? 'Mediabibliotek' : 'Media Library'}</h1>
          <p className="text-sm text-gray-500">{allItems.length} {sv ? 'filer totalt' : 'files total'} · {sv ? 'Visar' : 'Showing'} {total}</p>
        </div>
      </div>

      {/* Upload */}
      <form action={uploadMedia} className="bg-white rounded-xl border p-6">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-500 mb-1">{sv ? 'Ladda upp ny fil' : 'Upload new file'}</label>
            <input name="file" type="file" accept="image/*,video/*,.pdf" className="w-full text-sm border rounded px-3 py-2" required />
            <p className="text-xs text-gray-400 mt-1">{sv ? 'Bilder optimeras automatiskt (WebP, max 1920px)' : 'Images auto-optimized (WebP, max 1920px)'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Alt (SV)</label>
            <input name="altTextSv" className="w-full text-sm border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-500 mb-1">Alt (EN)</label>
              <input name="altTextEn" className="w-full text-sm border rounded px-3 py-2" />
            </div>
            <button className="self-end px-5 py-2 rounded-lg bg-[#E8B817] text-[#3D3D3D] font-bold text-sm whitespace-nowrap">{sv ? 'Ladda upp' : 'Upload'}</button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <a href={'/' + locale + '/admin/media'} className={'px-3 py-1.5 rounded-lg text-sm font-medium ' + (!sourceFilter ? 'bg-[#3D3D3D] text-[#E8B817]' : 'bg-white border hover:bg-gray-50')}>
          {sv ? 'Alla' : 'All'} ({allItems.length})
        </a>
        {Object.entries(sourceCounts).sort().map(([source, count]) => (
          <a key={source} href={'/' + locale + '/admin/media?source=' + source} className={'px-3 py-1.5 rounded-lg text-sm font-medium ' + (sourceFilter === source ? 'bg-[#3D3D3D] text-[#E8B817]' : 'bg-white border hover:bg-gray-50')}>
            {source} ({count})
          </a>
        ))}
        <form method="get" className="ml-auto flex gap-2">
          {sourceFilter && <input type="hidden" name="source" value={sourceFilter} />}
          <input name="q" defaultValue={search} placeholder={sv ? 'Sök...' : 'Search...'} className="text-sm border rounded px-3 py-1.5 w-48" />
          <button className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">🔍</button>
        </form>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          {sv ? 'Inga filer hittades.' : 'No files found.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl border overflow-hidden group relative">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="text-3xl text-gray-300">📄</div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] text-gray-700 truncate font-medium" title={item.url}>{item.filename}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>{formatBytes(item.sizeBytes)}</span>
                  <span className={'px-1.5 py-0.5 rounded text-[9px] font-medium ' +
                    (item.source === 'WordPress' ? 'bg-blue-50 text-blue-600' :
                     item.source === 'Seasonal' ? 'bg-green-50 text-green-600' :
                     item.source === 'Brand' ? 'bg-yellow-50 text-yellow-700' :
                     item.source === 'Uploads' ? 'bg-purple-50 text-purple-600' :
                     'bg-gray-50 text-gray-500')}>{item.source}</span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  <button onClick={'navigator.clipboard.writeText(window.location.origin+"' + item.url + '")'} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer" title="Copy URL">📋</button>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">↗</a>
                  {item.isDb && (
                    <form action={deleteMedia} className="inline">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={item.id} />
                      <button className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100">🗑</button>
                    </form>
                  )}
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
            <a key={p} href={'/' + locale + '/admin/media?page=' + p + (sourceFilter ? '&source=' + sourceFilter : '') + (search ? '&q=' + search : '')}
              className={'px-3 py-1 rounded text-sm ' + (p === page ? 'bg-[#3D3D3D] text-[#E8B817] font-bold' : 'border hover:bg-gray-50')}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
