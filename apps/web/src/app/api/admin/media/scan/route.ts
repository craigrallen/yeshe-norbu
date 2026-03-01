import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

function getPublicDir(): string {
  // Standalone mode
  const standalone = path.join(process.cwd(), 'public');
  if (fs.existsSync(standalone)) return standalone;
  // Dev mode
  const dev = path.join(process.cwd(), 'apps/web/public');
  if (fs.existsSync(dev)) return dev;
  return '';
}

function scanDir(dir: string, baseDir: string, results: any[]) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      scanDir(fullPath, baseDir, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      const stat = fs.statSync(fullPath);
      const relativePath = '/' + path.relative(baseDir, fullPath);
      results.push({
        id: 'fs:' + relativePath,
        filename: entry.name,
        url: relativePath,
        type: 'image',
        mimeType: ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg',
        sizeBytes: stat.size,
        source: relativePath.startsWith('/wp-media/') ? 'wordpress' :
                relativePath.startsWith('/seasons/') ? 'seasonal' :
                relativePath.startsWith('/brand/') ? 'brand' :
                relativePath.startsWith('/uploads/') ? 'upload' : 'other',
        createdAt: stat.mtime.toISOString(),
      });
    }
  }
}

export async function GET() {
  const pubDir = getPublicDir();
  if (!pubDir) return NextResponse.json({ files: [], error: 'No public directory found' });
  
  const results: any[] = [];
  scanDir(pubDir, pubDir, results);
  results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  
  return NextResponse.json({ files: results, total: results.length });
}
