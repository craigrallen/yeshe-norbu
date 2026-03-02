import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';
import { wpRedirects } from './wp-redirects';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle WordPress legacy redirects
  // Check exact match first
  if (wpRedirects[pathname]) {
    const target = new URL(`/sv${wpRedirects[pathname]}`, request.url);
    return NextResponse.redirect(target, 301);
  }

  // Check with locale prefix stripped (e.g. /en/about-us → /en/om-oss)
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname.startsWith(prefix + '/') || pathname === prefix) {
      const stripped = pathname.slice(prefix.length) || '/';
      if (wpRedirects[stripped]) {
        const target = new URL(`/${locale}${wpRedirects[stripped]}`, request.url);
        return NextResponse.redirect(target, 301);
      }
    }
  }

  const response = intlMiddleware(request);
  // Pass pathname to server components for layout detection (e.g. admin)
  response.headers.set('x-next-url', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
