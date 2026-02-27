import { NextRequest, NextResponse } from 'next/server';
import { parseSwishCallback } from '@yeshe/payments/swish';
import { createDb, payments, orders, auditLog } from '@yeshe/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = parseSwishCallback(body);

    const db = createDb(process.env.DATABASE_URL!);

    // Find payment by Swish ID
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.gatewayReference, callback.id))
      .limit(1);

    if (!payment) {
      console.error('Swish callback: payment not found for ID', callback.id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (callback.status === 'PAID') {
      await db.update(payments)
        .set({
          status: 'succeeded',
          gatewayResponse: callback,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      await db.update(orders)
        .set({ status: 'confirmed', updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));

      await db.insert(auditLog).values({
        action: 'payment.succeeded',
        channel: 'online',
        orderId: payment.orderId,
        paymentId: payment.id,
        method: 'swish',
        amountSek: callback.amount.toFixed(2),
        metadata: {
          swishPaymentId: callback.id,
          paymentReference: callback.paymentReference,
          payerAlias: callback.payerAlias,
        },
        description: `Swish payment confirmed: ${callback.paymentReference}`,
      });
    } else {
      const failStatus = callback.status === 'DECLINED' || callback.status === 'ERROR' ? 'failed' : 'failed';
      await db.update(payments)
        .set({
          status: failStatus,
          gatewayResponse: callback,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      await db.update(orders)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));

      await db.insert(auditLog).values({
        action: `payment.${callback.status.toLowerCase()}`,
        channel: 'online',
        orderId: payment.orderId,
        paymentId: payment.id,
        method: 'swish',
        amountSek: callback.amount.toFixed(2),
        metadata: {
          swishPaymentId: callback.id,
          errorCode: callback.errorCode,
          errorMessage: callback.errorMessage,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Swish webhook error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 400 });
  }
}
