import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { hashPassword, signToken, COOKIE_OPTIONS } from '@/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Token och lösenord krävs' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken' }, { status: 400 });

    const { rows } = await pool.query(
      `SELECT prt.user_id, u.email, u.first_name
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.used_at IS NULL`,
      [token]
    );

    if (!rows[0]) return NextResponse.json({ error: 'Ogiltig eller utgången länk' }, { status: 400 });

    const { user_id, email } = rows[0];
    const passwordHash = await hashPassword(password);

    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, user_id]);
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1', [user_id]);

    const sessionToken = signToken({ userId: user_id, email });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_OPTIONS.name, sessionToken, COOKIE_OPTIONS);
    return res;
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
