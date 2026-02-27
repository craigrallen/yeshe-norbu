import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createDb, orders, orderItems, payments, posTransactions, auditLog } from '@yeshe/db';
import { getAuthFromRequest } from '@yeshe/auth/middleware';

const transactionSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    priceSek: z.number(),
    quantity: z.number().int().positive(),
  })),
  method: z.enum(['stripe_card', 'swish', 'cash', 'complimentary']),
  totalSek: z.number().positive(),
  sessionId: z.string().uuid(),
  cashReceived: z.number().optional(),
  compReason: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request, process.env.JWT_SECRET!);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = transactionSchema.parse(body);
    const db = createDb(process.env.DATABASE_URL!);

    // Create order
    const [order] = await db.insert(orders).values({
      userId: data.customerEmail ? undefined : undefined, // Guest unless looked up
      channel: 'pos',
      status: 'confirmed',
      totalSek: data.totalSek.toFixed(2),
      discountSek: '0',
      netSek: data.totalSek.toFixed(2),
      staffUserId: auth.sub,
    }).returning();

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    await db.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        description: item.name,
        quantity: item.quantity,
        unitPriceSek: item.priceSek.toFixed(2),
        totalPriceSek: (item.priceSek * item.quantity).toFixed(2),
      })),
    );

    // Create payment record
    await db.insert(payments).values({
      orderId: order.id,
      method: data.method,
      status: 'succeeded',
      amountSek: data.totalSek.toFixed(2),
    });

    // Create POS transaction
    const changeGiven = data.cashReceived && data.cashReceived > data.totalSek
      ? data.cashReceived - data.totalSek
      : 0;

    await db.insert(posTransactions).values({
      sessionId: data.sessionId,
      orderId: order.id,
      method: data.method,
      amountSek: data.totalSek.toFixed(2),
      cashReceived: data.cashReceived?.toFixed(2),
      changeGiven: changeGiven.toFixed(2),
      compReason: data.compReason,
    });

    // Audit log — every transaction MUST be recorded
    await db.insert(auditLog).values({
      action: 'pos.transaction',
      channel: 'pos',
      staffUserId: auth.sub,
      orderId: order.id,
      method: data.method,
      amountSek: data.totalSek.toFixed(2),
      description: `POS sale: ${data.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
      metadata: {
        sessionId: data.sessionId,
        cashReceived: data.cashReceived,
        changeGiven,
        compReason: data.compReason,
      },
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('POS transaction error:', error);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}
