import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, locale = 'sv', email, metadata = {} } = body;

    if (!items?.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yeshe-norbu-production.up.railway.app';

    const session = await stripe.checkout.sessions.create({
      mode: metadata.type === 'subscription' ? 'subscription' : 'payment',
      customer_email: email,
      line_items: items.map((item: { name: string; amountSek: number; quantity?: number; description?: string }) => ({
        price_data: {
          currency: 'sek',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: Math.round(item.amountSek * 100),
          ...(metadata.type === 'subscription' ? {
            recurring: {
              interval: metadata.interval || 'year',
              interval_count: 1,
            }
          } : {}),
        },
        quantity: item.quantity || 1,
      })),
      success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale}/checkout/cancel`,
      locale: locale === 'sv' ? 'sv' : 'en',
      metadata: {
        ...metadata,
        locale,
      },
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
