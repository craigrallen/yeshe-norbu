'use client';

import { useState } from 'react';

type PaymentMethod = 'card' | 'swish' | 'cash' | 'comp';

/** Payment method selection screen for POS. */
export default function POSPaymentPage() {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [compReason, setCompReason] = useState('');

  // TODO: Parse total from URL params
  const total = 0;

  const methods: Array<{ id: PaymentMethod; label: string; icon: string; color: string }> = [
    { id: 'card', label: 'Kort', icon: '💳', color: 'bg-secondary text-white' },
    { id: 'swish', label: 'Swish', icon: '📱', color: 'bg-[#009FE3] text-white' },
    { id: 'cash', label: 'Kontant', icon: '💵', color: 'bg-green-600 text-white' },
    { id: 'comp', label: 'Frikort', icon: '🎁', color: 'bg-gray-600 text-white' },
  ];

  async function handlePay() {
    if (!selected) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/pos/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selected,
          totalSek: total,
          cashReceived: selected === 'cash' ? parseFloat(cashReceived) : undefined,
          compReason: selected === 'comp' ? compReason : undefined,
        }),
      });

      if (res.ok) {
        window.location.href = '/pos/receipt';
      }
    } catch {
      // Handle error
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <h1 className="text-xl font-bold text-primary text-center mb-2">Betalning</h1>
        <p className="text-2xl font-bold text-primary text-center mb-8">{total} kr</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`flex flex-col items-center justify-center rounded-lg p-6 text-center transition-all ${
                selected === m.id
                  ? `${m.color} ring-2 ring-brand ring-offset-2`
                  : 'border border-border bg-surface hover:bg-gray-50'
              }`}
            >
              <span className="text-3xl mb-2">{m.icon}</span>
              <span className={`text-sm font-medium ${selected === m.id ? '' : 'text-primary'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Cash input */}
        {selected === 'cash' && (
          <div className="mb-4">
            <label className="text-sm font-medium text-primary block mb-1">Mottaget belopp</label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-border bg-surface px-3 text-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="0"
            />
            {cashReceived && parseFloat(cashReceived) > total && (
              <p className="text-sm text-muted mt-1">
                Växel: {(parseFloat(cashReceived) - total).toFixed(2)} kr
              </p>
            )}
          </div>
        )}

        {/* Comp reason */}
        {selected === 'comp' && (
          <div className="mb-4">
            <label className="text-sm font-medium text-primary block mb-1">Anledning</label>
            <input
              type="text"
              value={compReason}
              onChange={(e) => setCompReason(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-border bg-surface px-3 text-base focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="T.ex. Frivillig, Lärare"
              required
            />
          </div>
        )}

        <div className="flex gap-3">
          <a
            href="/pos"
            className="flex-1 h-12 rounded-lg border border-border text-primary font-medium text-center leading-[48px] hover:bg-gray-50"
          >
            Avbryt
          </a>
          <button
            onClick={handlePay}
            disabled={!selected || processing}
            className="flex-1 h-12 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {processing ? 'Behandlar...' : 'Bekräfta'}
          </button>
        </div>
      </div>
    </div>
  );
}
