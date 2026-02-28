import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createECommercePayment, getSwishQrData } from '@yeshe/payments/swish';
import { createDb, orders, orderItems, payments, auditLog } from '@yeshe/db';

const swishSchema = z.object({
  amountSek: z.number().positive(),
  payerAlias: z.string().optional(),
  message: z.string().max(50).optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unitPriceSek: z.number().positive(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = swishSchema.parse(body);

    const db = createDb(process.env.DATABASE_URL!);

    const totalSek = data.items.reduce((sum, i) => sum + i.quantity * i.unitPriceSek, 0);

    // Create order
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

    await db.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceSek: item.unitPriceSek.toFixed(2),
        totalPriceSek: (item.quantity * item.unitPriceSek).toFixed(2),
      })),
    );

    // Create Swish payment
    const swishPayment = await createECommercePayment({
      amount: totalSek,
      payerAlias: data.payerAlias,
      message: data.message ?? 'Yeshin Norbu',
      payeePaymentReference: order.id,
    });

    // Record payment
    await db.insert(payments).values({
      orderId: order.id,
      method: 'swish',
      status: 'pending',
      amountSek: totalSek.toFixed(2),
      gatewayReference: swishPayment.id,
    });

    // Audit
    await db.insert(auditLog).values({
      action: 'payment.swish_created',
      channel: 'online',
      orderId: order.id,
      method: 'swish',
      amountSek: totalSek.toFixed(2),
      ipAddress: request.headers.get('x-forwarded-for'),
      metadata: { swishPaymentId: swishPayment.id },
    });

    return NextResponse.json({
      orderId: order.id,
      swishPaymentId: swishPayment.id,
      qrData: swishPayment.paymentRequestToken
        ? getSwishQrData(swishPayment.paymentRequestToken)
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Swish payment error:', error);
    return NextResponse.json({ error: 'Failed to create Swish payment' }, { status: 500 });
  }
}
