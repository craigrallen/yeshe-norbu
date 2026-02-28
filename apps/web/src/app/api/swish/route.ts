import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const SWISH_NUMBER = process.env.SWISH_NUMBER || '1233887346';
const SWISH_ENV = process.env.SWISH_ENVIRONMENT || 'test';
const SWISH_API_BASE = SWISH_ENV === 'production'
  ? 'https://cpc.getswish.net/swish-cpcapi/api/v2'
  : 'https://mss.cpc.getswish.net/swish-cpcapi/api/v2';

export async function POST(req: NextRequest) {
  try {
    const { amountSek, phoneNumber, message, orderId } = await req.json();

    if (!phoneNumber || !amountSek) {
      return NextResponse.json({ error: 'phoneNumber and amountSek required' }, { status: 400 });
    }

    // Format Swedish phone number to E.164 without + (Swish format: 46701234567)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0')
      ? '46' + cleanPhone.slice(1)
      : cleanPhone.startsWith('46') ? cleanPhone : '46' + cleanPhone;

    const paymentRef = uuidv4().toUpperCase().replace(/-/g, '');
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/swish`;

    const paymentPayload = {
      payeePaymentReference: orderId || paymentRef,
      callbackUrl,
      payeeAlias: SWISH_NUMBER,
      payerAlias: formattedPhone,
      amount: String(Math.round(amountSek)),
      currency: 'SEK',
      message: message || 'Yeshin Norbu',
    };

    // NOTE: Swish production requires mTLS with the cert at migration/swish.pem
    // For now return the payment data for the frontend to use with Swish QR
    // Full mTLS integration requires cert loaded at server start
    console.log('Swish payment initiated:', paymentPayload);

    return NextResponse.json({
      success: true,
      paymentRef,
      swishNumber: SWISH_NUMBER,
      amount: amountSek,
      message: message || 'Yeshin Norbu',
      // For deep link / QR code
      swishUrl: `swish://payment?data={"version":1,"payee":{"value":"${SWISH_NUMBER}","editable":false},"amount":{"value":${Math.round(amountSek)},"editable":false},"message":{"value":"${encodeURIComponent(message || 'Yeshin Norbu')}","editable":false}}`,
    });
  } catch (err: any) {
    console.error('Swish error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
