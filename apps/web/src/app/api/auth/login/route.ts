import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verify } from '@yeshe/auth/password';
import { createTokenPair } from '@yeshe/auth/jwt';
import { createDb, users, userRoles, auditLog } from '@yeshe/db';
import { eq } from 'drizzle-orm';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const db = createDb(process.env.DATABASE_URL!);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verify(user.passwordHash, data.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get user roles
    const roles = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleNames = roles.map((r) => r.role);

    const { accessToken, refreshToken } = await createTokenPair(
      { id: user.id, email: user.email, roles: roleNames },
      process.env.JWT_SECRET!,
    );

    // Audit log
    await db.insert(auditLog).values({
      action: 'user.login',
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      description: `User ${user.email} logged in`,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.firstName },
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
