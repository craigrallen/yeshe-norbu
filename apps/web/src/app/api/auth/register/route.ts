import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { hashPassword, signToken, COOKIE_OPTIONS } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, locale = 'sv' } = await req.json();

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Förnamn, e-post och lösenord krävs' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken' }, { status: 400 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Det finns redan ett konto med den e-postadressen' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, email_verified, password_hash, first_name, last_name, locale, consent_marketing, consent_analytics, created_at, updated_at)
       VALUES ($1, false, $2, $3, $4, $5, false, false, NOW(), NOW())
       RETURNING id, email, first_name, last_name`,
      [email.toLowerCase().trim(), passwordHash, firstName.trim(), (lastName || '').trim(), locale]
    );

    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.first_name).catch(e => console.error('Welcome email failed:', e));

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name }
    }, { status: 201 });
    res.cookies.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);
    return res;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}
