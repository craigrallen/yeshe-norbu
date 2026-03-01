import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  // Try multiple possible locations for standalone deployment
  const candidates = [
    join(process.cwd(), 'apps', 'web', 'public', 'prototype.html'),
    join(process.cwd(), 'public', 'prototype.html'),
    join(__dirname, '..', '..', '..', '..', 'public', 'prototype.html'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      const html = readFileSync(p, 'utf-8');
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  }
  return new NextResponse(`Not found. cwd=${process.cwd()} tried=${candidates.join(', ')}`, { status: 404 });
}
