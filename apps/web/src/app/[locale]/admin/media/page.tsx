import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { createDb, media } from '@yeshe/db';
import { desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

async function uploadMedia(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const locale = String(formData.get('locale') || 'sv');
  const file = formData.get('file') as File | null;
  const altSv = String(formData.get('altSv') || '');
  const altEn = String(formData.get('altEn') || '');
  if (!file || !file.size) return;

  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const rel = `/uploads/${safe}`;
  const abs = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(abs, { recursive: true });
  await writeFile(path.join(abs, safe), bytes);

  await db.insert(media).values({
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    type: (file.type || '').startsWith('image/') ? 'image' as any : 'document' as any,
    url: rel,
    altTextSv: altSv || null,
    altTextEn: altEn || null,
    sizeBytes: file.size,
  });

  revalidatePath(`/${locale}/admin/media`);
}

export default async function AdminMedia({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  const rows = await db.select().from(media).orderBy(desc(media.createdAt)).limit(200);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{sv ? 'Media' : 'Media Library'}</h1>
      <form action={uploadMedia} className="bg-white rounded-xl border p-4 grid md:grid-cols-4 gap-2 items-end">
        <input type="hidden" name="locale" value={locale} />
        <input type="file" name="file" accept="image/*" className="border rounded px-3 py-2 md:col-span-2" required />
        <input name="altSv" placeholder="Alt text SV" className="border rounded px-3 py-2" />
        <input name="altEn" placeholder="Alt text EN" className="border rounded px-3 py-2" />
        <button className="px-3 py-2 rounded bg-[#58595b] text-white md:col-span-4 w-fit">+ {sv ? 'Ladda upp' : 'Upload'}</button>
      </form>
      <div className="grid md:grid-cols-4 gap-4">
        {rows.map((m) => (
          <div key={m.id} className="bg-white border rounded-lg p-3 text-xs">
            {m.type === 'image' ? <img src={m.url} alt={m.altTextSv || ''} className="w-full h-32 object-cover rounded mb-2" /> : <div className="h-32 bg-gray-100 rounded mb-2" />}
            <div className="truncate font-medium">{m.filename}</div>
            <div className="text-gray-500 break-all">{m.url}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
