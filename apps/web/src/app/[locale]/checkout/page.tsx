'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface CheckoutItem {
  name: string;
  description?: string;
  amountSek: number;
  quantity: number;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item] = useState<CheckoutItem>({
    name: searchParams.get('name') || 'Betalning',
    description: searchParams.get('desc') || '',
    amountSek: Number(searchParams.get('amount') || 0),
    quantity: Number(searchParams.get('qty') || 1),
  });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'stripe' | 'swish'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [swishData, setSwishData] = useState<{ swishUrl: string; swishNumber: string; amount: number } | null>(null);

  const total = item.amountSek * item.quantity;

  async function handleStripe() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [item],
          email,
          metadata: { type: searchParams.get('type') || 'payment' },
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Något gick fel');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwish() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/swish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountSek: total,
          phoneNumber: phone,
          message: item.name,
        }),
      });
      const data = await res.json();
      if (data.swishUrl) setSwishData(data);
      else setError(data.error || 'Swish-betalning misslyckades');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!item.amountSek) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#58595b]">Ingen betalning vald</h1>
          <button onClick={() => router.push('/')} className="mt-4 text-[#f5ca00] hover:underline">
            Tillbaka till startsidan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#58595b] mb-2">Kassa</h1>
          <p className="text-gray-500">Säker betalning</p>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-[#58595b] mb-4">Din beställning</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{item.name}</p>
              {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
              {item.quantity > 1 && <p className="text-sm text-gray-400">{item.quantity} × {item.amountSek} kr</p>}
            </div>
            <p className="font-semibold text-lg">{total.toLocaleString('sv-SE')} kr</p>
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between">
            <span className="font-semibold">Totalt</span>
            <span className="font-bold text-xl text-[#58595b]">{total.toLocaleString('sv-SE')} kr</span>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-[#58595b] mb-4">Välj betalmetod</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('stripe')}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                method === 'stripe' ? 'border-[#f5ca00] bg-[#FFF9EE]' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">💳</div>
              <div className="font-medium text-sm">Kort</div>
              <div className="text-xs text-gray-400">Visa, Mastercard</div>
            </button>
            <button
              onClick={() => setMethod('swish')}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                method === 'swish' ? 'border-[#f5ca00] bg-[#FFF9EE]' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">📱</div>
              <div className="font-medium text-sm">Swish</div>
              <div className="text-xs text-gray-400">Mobil betalning</div>
            </button>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {method === 'stripe' ? (
            <div>
              <h2 className="font-semibold text-[#58595b] mb-4">Kortbetalning</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">E-postadress</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f5ca00] focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Du skickas till Stripes säkra betalningssida. Vi accepterar Visa, Mastercard, Apple Pay och Google Pay.
              </p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleStripe}
                disabled={loading || !email}
                className="w-full bg-[#58595b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#6b6c6e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Behandlar...' : `Betala ${total.toLocaleString('sv-SE')} kr`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Säker betalning via Stripe</p>
            </div>
          ) : swishData ? (
            <div className="text-center">
              <h2 className="font-semibold text-[#58595b] mb-4">Swish-betalning</h2>
              <div className="bg-[#FFF9EE] rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-600 mb-2">Swishnummer:</p>
                <p className="text-3xl font-bold text-[#58595b] mb-2">{swishData.swishNumber}</p>
                <p className="text-lg font-semibold">{swishData.amount.toLocaleString('sv-SE')} kr</p>
              </div>
              <a
                href={swishData.swishUrl}
                className="block w-full bg-[#00B14F] text-white font-semibold py-3.5 rounded-xl hover:bg-[#009940] transition-colors mb-3"
              >
                📱 Öppna Swish-appen
              </a>
              <p className="text-sm text-gray-500">
                Har du inte appen? Swisha manuellt till <strong>{swishData.swishNumber}</strong>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-[#58595b] mb-4">Swish</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ditt mobilnummer</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="07X XXX XX XX"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f5ca00] focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Det nummer du betalar med via Swish</p>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                onClick={handleSwish}
                disabled={loading || !phone}
                className="w-full bg-[#00B14F] text-white font-semibold py-3.5 rounded-xl hover:bg-[#009940] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Skapar betalning...' : `Betala med Swish ${total.toLocaleString('sv-SE')} kr`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center"><p>Laddar...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
