import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    const locale = req.nextUrl.searchParams.get('locale') || 'sv';
    return NextResponse.redirect(new URL(`/${locale}/logga-in`, req.url));
  }

  const planSlug = req.nextUrl.searchParams.get('plan');
  const locale = req.nextUrl.searchParams.get('locale') || 'sv';
  if (!planSlug) return NextResponse.json({ error: 'plan is required' }, { status: 400 });

  const { rows: userRows } = await pool.query('SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = $1 LIMIT 1', [session.userId]);
  const user = userRows[0];
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows: planRows } = await pool.query(
    'SELECT id, slug, name_sv, name_en, price_sek, interval_months, stripe_price_id FROM membership_plans WHERE slug = $1 AND active = true LIMIT 1',
    [planSlug]
  );
  const plan = planRows[0];
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

  let customerId = user.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, user.id]);
  }

  const intervalMonths = Number(plan.interval_months || 12);
  const recurring = intervalMonths % 12 === 0
    ? { interval: 'year' as const, interval_count: Math.max(1, intervalMonths / 12) }
    : { interval: 'month' as const, interval_count: Math.max(1, intervalMonths) };

  const lineItem = plan.stripe_price_id
    ? { price: plan.stripe_price_id, quantity: 1 }
    : {
        price_data: {
          currency: 'sek',
          unit_amount: Math.round(Number(plan.price_sek) * 100),
          recurring,
          product_data: { name: locale === 'sv' ? plan.name_sv : plan.name_en },
        },
        quantity: 1,
      };

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [lineItem as any],
    success_url: `${req.nextUrl.origin}/${locale}/konto?subscription=success`,
    cancel_url: `${req.nextUrl.origin}/${locale}/bli-medlem?subscription=cancelled`,
    metadata: {
      userId: user.id,
      planId: plan.id,
      planSlug: plan.slug,
      source: 'membership_page',
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        planId: plan.id,
        planSlug: plan.slug,
      },
    },
  });

  return NextResponse.redirect(checkout.url!);
}
