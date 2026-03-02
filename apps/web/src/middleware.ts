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

  // Clone request with pathname header so server components can detect admin routes
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-next-url', pathname);
  const modifiedRequest = new NextRequest(request.url, { headers: reqHeaders });
  const response = intlMiddleware(modifiedRequest);
  response.headers.set('x-next-url', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
