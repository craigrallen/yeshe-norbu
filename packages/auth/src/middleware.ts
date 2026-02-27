import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from './jwt';

/**
 * Extract and verify the JWT from the Authorization header or cookie.
 * @param request - The incoming Next.js request
 * @param secret - JWT signing secret
 * @returns The decoded token payload, or null if invalid/missing
 */
export async function getAuthFromRequest(
  request: NextRequest,
  secret: string,
): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = request.cookies.get('access_token')?.value;
  }

  if (!token) return null;

  try {
    return await verifyToken(token, secret);
  } catch {
    return null;
  }
}

/**
 * Create a Next.js middleware that protects routes requiring authentication.
 * @param secret - JWT signing secret
 * @param protectedPaths - Array of path prefixes that require auth
 */
export function createAuthMiddleware(secret: string, protectedPaths: string[]) {
  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    if (!isProtected) {
      return NextResponse.next();
    }

    const payload = await getAuthFromRequest(request, secret);
    if (!payload) {
      const loginUrl = new URL('/logga-in', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.sub);
    headers.set('x-user-email', payload.email);
    headers.set('x-user-roles', (payload.roles ?? []).join(','));

    return NextResponse.next({ request: { headers } });
  };
}
