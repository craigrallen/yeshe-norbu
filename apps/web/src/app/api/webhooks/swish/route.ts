import { NextRequest, NextResponse } from 'next/server';

// Swish sends payment result callbacks as JSON POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, amount, currency, payerAlias, message, errorCode } = body;

    console.log('Swish callback:', { id, status, amount, currency });

    if (status === 'PAID') {
      // TODO: Mark order as paid in DB, send confirmation email
      console.log('Swish payment confirmed:', id, amount, 'SEK from', payerAlias);
    } else if (status === 'DECLINED' || status === 'ERROR') {
      console.log('Swish payment failed:', id, errorCode);
      // TODO: Mark order as failed
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
