import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { generateResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'E-post krävs' }, { status: 400 });

    const { rows } = await pool.query(
      'SELECT id, first_name FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase().trim()]
    );

    // Always return success to avoid email enumeration
    if (!rows[0]) return NextResponse.json({ ok: true });

    const token = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
      [rows[0].id, token, expires]
    );

    await sendPasswordResetEmail(email, rows[0].first_name, token);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
