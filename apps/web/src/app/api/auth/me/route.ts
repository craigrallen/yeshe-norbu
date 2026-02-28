import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.locale,
            m.status as membership_status, mp.name_sv as plan_name
     FROM users u
     LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'active'
     LEFT JOIN membership_plans mp ON mp.id = m.plan_id
     WHERE u.id = $1 AND u.deleted_at IS NULL
     LIMIT 1`,
    [session.userId]
  );

  if (!rows[0]) return NextResponse.json({ user: null });
  return NextResponse.json({ user: rows[0] });
}
