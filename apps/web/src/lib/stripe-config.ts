import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type StripeConfig = {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
};

export async function getStripeConfig(): Promise<StripeConfig> {
  const { rows } = await pool.query(
    `SELECT key, value
     FROM app_settings
     WHERE key IN ('stripe.publishable_key','stripe.secret_key','stripe.webhook_secret')`
  );

  const map = new Map(rows.map((r: any) => [r.key, String(r.value || '')]));

  return {
    publishableKey: map.get('stripe.publishable_key') || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: map.get('stripe.secret_key') || process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: map.get('stripe.webhook_secret') || process.env.STRIPE_WEBHOOK_SECRET || '',
  };
}
