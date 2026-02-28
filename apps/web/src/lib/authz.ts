import { Pool } from 'pg';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function requireAdmin(locale: string) {
  const session = await getSession();
  if (!session?.userId) redirect(`/${locale}/logga-in`);

  const { rows } = await pool.query(
    `SELECT 1
     FROM user_roles
     WHERE user_id = $1 AND role = 'admin'
     LIMIT 1`,
    [session.userId]
  );

  if (!rows[0]) redirect(`/${locale}/konto`);
  return session;
}
