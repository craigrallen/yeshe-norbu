import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from '@yeshe/auth/password';
import { createTokenPair } from '@yeshe/auth/jwt';
import { createDb, users, userRoles } from '@yeshe/db';

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  locale: z.enum(['sv', 'en']).optional().default('sv'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const db = createDb(process.env.DATABASE_URL!);
    const passwordHash = await hash(data.password);

    const [user] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        locale: data.locale,
      })
      .returning({ id: users.id, email: users.email });

    if (!user) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    // Assign customer role
    await db.insert(userRoles).values({
      userId: user.id,
      role: 'customer',
    });

    const { accessToken, refreshToken } = await createTokenPair(
      { id: user.id, email: user.email, roles: ['customer'] },
      process.env.JWT_SECRET!,
    );

    const response = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
      path: '/',
    });
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 3600, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
