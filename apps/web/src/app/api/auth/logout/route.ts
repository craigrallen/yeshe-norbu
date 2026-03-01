import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_OPTIONS } from '@/lib/auth';

function clearSession(res: NextResponse) {
  res.cookies.set(COOKIE_OPTIONS.name, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}

export async function POST() {
  return clearSession(NextResponse.json({ ok: true }));
}

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/';
  return clearSession(NextResponse.redirect(new URL(next, request.url)));
}
