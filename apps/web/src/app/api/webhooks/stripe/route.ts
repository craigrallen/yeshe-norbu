import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@yeshe/payments/stripe';
import { createDb, payments, orders, auditLog } from '@yeshe/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const event = constructWebhookEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    const db = createDb(process.env.DATABASE_URL!);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await db.update(payments)
            .set({ status: 'succeeded', updatedAt: new Date() })
            .where(eq(payments.gatewayReference, intent.id));

          await db.update(orders)
            .set({ status: 'confirmed', updatedAt: new Date() })
            .where(eq(orders.id, orderId));

          await db.insert(auditLog).values({
            action: 'payment.succeeded',
            channel: 'online',
            orderId,
            method: 'stripe_card',
            amountSek: (intent.amount / 100).toFixed(2),
            metadata: { stripeIntentId: intent.id },
            description: `Payment succeeded for order ${orderId}`,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await db.update(payments)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(payments.gatewayReference, intent.id));

          await db.update(orders)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(orders.id, orderId));

          await db.insert(auditLog).values({
            action: 'payment.failed',
            channel: 'online',
            orderId,
            method: 'stripe_card',
            amountSek: (intent.amount / 100).toFixed(2),
            metadata: { stripeIntentId: intent.id, error: intent.last_payment_error?.message },
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await db.insert(auditLog).values({
          action: `subscription.${event.type.split('.').pop()}`,
          metadata: {
            subscriptionId: subscription.id,
            customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.toString(),
            status: subscription.status,
          },
        });
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await db.insert(auditLog).values({
          action: `invoice.${event.type === 'invoice.paid' ? 'paid' : 'failed'}`,
          amountSek: ((invoice.amount_paid ?? 0) / 100).toFixed(2),
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: typeof invoice.subscription === 'string' ? invoice.subscription : null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
