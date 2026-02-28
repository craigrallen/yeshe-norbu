import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyPassword, signToken, COOKIE_OPTIONS } from '@/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email och lösenord krävs' }, { status: 400 });

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, deleted_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user || user.deleted_at) return NextResponse.json({ error: 'Felaktig e-post eller lösenord' }, { status: 401 });

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Felaktig e-post eller lösenord' }, { status: 401 });

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name }
    });
    res.cookies.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);
    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
