import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeConfig } from '@/lib/stripe-config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Protected by SYNC_API_KEY header; set same value in Railway env
function isAuthorized(req: NextRequest) {
  const key = req.headers.get('x-sync-api-key');
  return !!process.env.SYNC_API_KEY && key === process.env.SYNC_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Number(body.limit || 500), 5000);

  const stripeCfg = await getStripeConfig();
  const stripe = new Stripe(stripeCfg.secretKey, { apiVersion: '2024-04-10' });

  let inserted = 0;
  let matchedByRef = 0;
  let matchedByAmountTime = 0;
  let processed = 0;

  // Build quick cache of orders (online only)
  const { rows: orders } = await pool.query(
    `SELECT id, total_sek, created_at
     FROM orders
     WHERE channel = 'online'
     ORDER BY created_at DESC`
  );

  const orderByAmount = new Map<number, Array<{ id: string; createdAt: number }>>();
  for (const o of orders) {
    const amount = Math.round(Number(o.total_sek) * 100);
    if (!orderByAmount.has(amount)) orderByAmount.set(amount, []);
    orderByAmount.get(amount)!.push({ id: o.id, createdAt: new Date(o.created_at).getTime() });
  }

  // Existing payment refs so we don't duplicate
  const { rows: existing } = await pool.query(`SELECT gateway_reference FROM payments WHERE gateway_reference IS NOT NULL`);
  const existingRefs = new Set(existing.map((r) => r.gateway_reference));

  let startingAfter: string | undefined;
  while (processed < limit) {
    const page = await stripe.charges.list({
      limit: Math.min(100, limit - processed),
      starting_after: startingAfter,
      expand: ['data.customer'],
    });

    if (!page.data.length) break;

    for (const ch of page.data) {
      processed++;
      if (existingRefs.has(ch.id)) continue;

      if (ch.currency?.toLowerCase() !== 'sek') continue;

      let orderId: string | null = null;

      // 1) Match by metadata order id/number if present
      const metaOrder = ch.metadata?.order_id || ch.metadata?.order_number;
      if (metaOrder) {
        const hit = await pool.query(
          `SELECT id FROM orders WHERE order_number::text = $1 LIMIT 1`,
          [String(metaOrder)]
        );
        if (hit.rows[0]) {
          orderId = hit.rows[0].id;
          matchedByRef++;
        }
      }

      // 2) Fallback match by amount + nearest timestamp (within 2h)
      if (!orderId) {
        const amountCents = ch.amount;
        const candidates = orderByAmount.get(amountCents) || [];
        if (candidates.length) {
          const chargeTs = (ch.created || 0) * 1000;
          let best: { id: string; delta: number } | null = null;
          for (const c of candidates) {
            const delta = Math.abs(c.createdAt - chargeTs);
            if (delta <= 2 * 60 * 60 * 1000 && (!best || delta < best.delta)) {
              best = { id: c.id, delta };
            }
          }
          if (best) {
            orderId = best.id;
            matchedByAmountTime++;
          }
        }
      }

      if (!orderId) continue;

      const status = ch.status === 'succeeded' ? 'succeeded' : ch.status === 'failed' ? 'failed' : 'pending';

      await pool.query(
        `INSERT INTO payments (order_id, method, status, amount_sek, gateway_reference, gateway_response, created_at)
         VALUES ($1, 'stripe_card', $2::payment_status, $3, $4, $5::jsonb, to_timestamp($6))`,
        [
          orderId,
          status,
          (ch.amount || 0) / 100,
          ch.id,
          JSON.stringify({
            payment_intent: ch.payment_intent,
            customer: typeof ch.customer === 'string' ? ch.customer : ch.customer?.id,
            receipt_url: ch.receipt_url,
            billing_email: ch.billing_details?.email,
            metadata: ch.metadata,
          }),
          ch.created || Math.floor(Date.now() / 1000),
        ]
      );

      inserted++;
      existingRefs.add(ch.id);
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return NextResponse.json({
    ok: true,
    processed,
    inserted,
    matchedByRef,
    matchedByAmountTime,
  });
}
