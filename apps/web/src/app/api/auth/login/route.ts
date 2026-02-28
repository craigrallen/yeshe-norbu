import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyPassword, signToken, COOKIE_OPTIONS } from '@/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || '').toLowerCase().trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'E-post/Användarnamn och lösenord krävs' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT id, email, username, password_hash, first_name, last_name, deleted_at
       FROM users
       WHERE LOWER(email) = $1 OR LOWER(username) = $1
       LIMIT 1`,
      [identifier]
    );

    const user = rows[0];
    if (!user || user.deleted_at) {
      return NextResponse.json({ error: 'Felaktig e-post/användarnamn eller lösenord' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Felaktig e-post/användarnamn eller lösenord' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });

    res.cookies.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);
    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
