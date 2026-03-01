import { NextRequest, NextResponse } from 'next/server';
import { createDb, media } from '@yeshe/db';
import { desc, sql, eq } from 'drizzle-orm';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

function getUploadDir() {
  const a = join(process.cwd(), 'apps', 'web', 'public', 'uploads');
  const b = join(process.cwd(), 'public', 'uploads');
  return existsSync(join(process.cwd(), 'apps', 'web', 'public')) ? a : b;
}

const OPT = { maxWidth: 1920, thumbWidth: 400, quality: 80 };

export async function GET(req: NextRequest) {
  const db = createDb(process.env.DATABASE_URL!);
  const page = Number(req.nextUrl.searchParams.get('page') || '1');
  const limit = 48;
  const offset = (page - 1) * limit;
  const typeFilter = req.nextUrl.searchParams.get('type') || '';

  const where = typeFilter ? sql`type = ${typeFilter}` : sql`1=1`;
  const [items, countResult] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(media).where(where),
  ]);
  return NextResponse.json({ items, total: countResult[0]?.count || 0, page, pages: Math.ceil((countResult[0]?.count || 0) / limit) });
}

export async function POST(req: NextRequest) {
  const db = createDb(process.env.DATABASE_URL!);
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const altSv = String(formData.get('altTextSv') || '');
  const altEn = String(formData.get('altTextEn') || '');
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extname(file.name).toLowerCase();
  const id = randomUUID();
  const dir = getUploadDir();
  mkdirSync(dir, { recursive: true });

  const isImage = /\.(jpg|jpeg|png|gif|webp|avif|tiff|bmp)$/i.test(file.name);
  let url: string, thumbUrl: string | null = null, sizeBytes: number, mimeType: string;

  if (isImage) {
    const image = sharp(buffer);
    const optimized = await image.resize({ width: OPT.maxWidth, withoutEnlargement: true }).webp({ quality: OPT.quality }).toBuffer();
    const filename = `${id}.webp`;
    writeFileSync(join(dir, filename), optimized);
    url = `/uploads/${filename}`;
    sizeBytes = optimized.length;
    mimeType = 'image/webp';

    const thumb = await sharp(buffer).resize({ width: OPT.thumbWidth, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
    writeFileSync(join(dir, `${id}-thumb.webp`), thumb);
    thumbUrl = `/uploads/${id}-thumb.webp`;

    writeFileSync(join(dir, `${id}-original${ext}`), buffer);
  } else {
    const filename = `${id}${ext}`;
    writeFileSync(join(dir, filename), buffer);
    url = `/uploads/${filename}`;
    sizeBytes = buffer.length;
    mimeType = file.type || 'application/octet-stream';
  }

  const mediaType = isImage ? 'image' : file.type?.startsWith('video/') ? 'video' : 'document';
  const [inserted] = await db.insert(media).values({ filename: file.name, mimeType, type: mediaType as any, url, altTextSv: altSv || null, altTextEn: altEn || null, sizeBytes }).returning();

  return NextResponse.json({ ...inserted, thumbUrl, originalSize: buffer.length, optimizedSize: sizeBytes, savedPercent: isImage ? Math.round((1 - sizeBytes / buffer.length) * 100) : 0 });
}

export async function DELETE(req: NextRequest) {
  const db = createDb(process.env.DATABASE_URL!);
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 });
  const [item] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Try to delete files
  const dir = getUploadDir();
  try { unlinkSync(join(dir, item.url.replace('/uploads/', ''))); } catch {}
  try { unlinkSync(join(dir, item.url.replace('/uploads/', '').replace('.webp', '-thumb.webp'))); } catch {}

  await db.delete(media).where(eq(media.id, id));
  return NextResponse.json({ ok: true });
}
