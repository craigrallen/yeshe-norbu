import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent, getOrCreateCustomer } from '@yeshe/payments/stripe';
import { createDb, orders, orderItems, payments, auditLog } from '@yeshe/db';
import { getAuthFromRequest } from '@yeshe/auth/middleware';

const intentSchema = z.object({
  amountSek: z.number().positive(),
  description: z.string().max(500),
  email: z.string().email(),
  name: z.string().min(1),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPriceSek: z.number().positive(),
  })),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = intentSchema.parse(body);

    const db = createDb(process.env.DATABASE_URL!);

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(data.email, data.name);

    // Create order
    const totalSek = data.items.reduce((sum, i) => sum + i.quantity * i.unitPriceSek, 0);
    const [order] = await db.insert(orders).values({
      status: 'pending',
      channel: 'online',
      totalSek: totalSek.toFixed(2),
      discountSek: '0',
      netSek: totalSek.toFixed(2),
      ipAddress: request.headers.get('x-forwarded-for'),
    }).returning();

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    await db.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceSek: item.unitPriceSek.toFixed(2),
        totalPriceSek: (item.quantity * item.unitPriceSek).toFixed(2),
      })),
    );

    // Create Stripe PaymentIntent
    const intent = await createPaymentIntent({
      amountSek: totalSek,
      customerId: customer.id,
      metadata: { orderId: order.id, ...data.metadata },
      description: data.description,
      receiptEmail: data.email,
    });

    // Record payment
    await db.insert(payments).values({
      orderId: order.id,
      method: 'stripe_card',
      status: 'pending',
      amountSek: totalSek.toFixed(2),
      gatewayReference: intent.id,
    });

    // Audit
    await db.insert(auditLog).values({
      action: 'payment.intent_created',
      channel: 'online',
      orderId: order.id,
      method: 'stripe_card',
      amountSek: totalSek.toFixed(2),
      ipAddress: request.headers.get('x-forwarded-for'),
      metadata: { stripeIntentId: intent.id },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
