import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createAccessToken } from '@yeshe/auth/jwt';
import { createDb, users, userRoles } from '@yeshe/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken, process.env.JWT_SECRET!);
    const db = createDb(process.env.DATABASE_URL!);

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user || user.deletedAt) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const roles = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const accessToken = await createAccessToken(
      { sub: user.id, email: user.email, roles: roles.map((r) => r.role) },
      process.env.JWT_SECRET!,
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
