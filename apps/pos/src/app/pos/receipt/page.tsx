'use client';

import { useState } from 'react';

/** Receipt screen — print, email, or skip. */
export default function POSReceiptPage() {
  const [emailAddress, setEmailAddress] = useState('');

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm text-center p-6">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-primary mb-2">Betalning genomförd</h1>
        <p className="text-sm text-muted mb-8">Kvitto?</p>

        <div className="space-y-3">
          <button
            onClick={() => window.print()}
            className="w-full h-12 rounded-lg border border-border bg-surface text-primary font-medium hover:bg-gray-50 transition-colors"
          >
            🖨️ Skriv ut kvitto
          </button>

          <div className="flex gap-2">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="E-postadress"
              className="flex-1 h-12 rounded-lg border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              disabled={!emailAddress}
              className="h-12 px-4 rounded-lg bg-secondary text-white font-medium text-sm hover:bg-secondary-dark disabled:opacity-50 transition-colors"
            >
              Skicka
            </button>
          </div>

          <a
            href="/pos"
            className="block w-full h-12 rounded-lg bg-brand text-white font-medium text-center leading-[48px] hover:bg-brand-dark transition-colors"
          >
            Ny försäljning
          </a>
        </div>
      </div>
    </div>
  );
}
