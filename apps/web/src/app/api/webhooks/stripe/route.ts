import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeConfig } from '@/lib/stripe-config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function upsertMembershipFromSubscription(sub: Stripe.Subscription) {
  const userId = (sub.metadata?.userId || sub.metadata?.user_id || '') as string;
  const planId = (sub.metadata?.planId || sub.metadata?.plan_id || '') as string;
  if (!userId || !planId) return;

  const status = sub.status === 'active' || sub.status === 'trialing' ? 'active'
    : sub.status === 'canceled' || sub.status === 'unpaid' ? 'cancelled'
    : 'paused';

  await pool.query(
    `INSERT INTO memberships (user_id, plan_id, status, stripe_subscription_id, current_period_start, current_period_end, updated_at)
     VALUES ($1, $2, $3::membership_status, $4, to_timestamp($5), to_timestamp($6), now())
     ON CONFLICT (stripe_subscription_id)
     DO UPDATE SET status = EXCLUDED.status,
                   current_period_start = EXCLUDED.current_period_start,
                   current_period_end = EXCLUDED.current_period_end,
                   updated_at = now()`,
    [userId, planId, status, sub.id, sub.current_period_start, sub.current_period_end]
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  const stripeCfg = await getStripeConfig();
  const stripe = new Stripe(stripeCfg.secretKey, { apiVersion: '2024-04-10' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeCfg.webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        await upsertMembershipFromSubscription(sub);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await upsertMembershipFromSubscription(sub);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await pool.query(
        `UPDATE memberships
         SET status = 'cancelled'::membership_status,
             cancelled_at = now(),
             updated_at = now()
         WHERE stripe_subscription_id = $1`,
        [sub.id]
      );
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      if (subId) {
        await pool.query(
          `UPDATE memberships
           SET status = 'active'::membership_status,
               current_period_end = to_timestamp($2),
               updated_at = now()
           WHERE stripe_subscription_id = $1`,
          [subId, (invoice.lines.data[0]?.period?.end || Math.floor(Date.now() / 1000))]
        );
      }
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      if (subId) {
        await pool.query(
          `UPDATE memberships
           SET status = 'paused'::membership_status, updated_at = now()
           WHERE stripe_subscription_id = $1`,
          [subId]
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
