'use client';

/** Day-end reconciliation page for POS. */
export default function POSDayEndPage() {
  // TODO: Fetch session data from API

  const summary = {
    sessionStart: '09:00',
    openingFloat: 1000,
    cardTotal: 0,
    swishTotal: 0,
    cashTotal: 0,
    compTotal: 0,
    transactionCount: 0,
  };

  const grandTotal = summary.cardTotal + summary.swishTotal + summary.cashTotal + summary.compTotal;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-primary mb-6">Dagslut</h1>

        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Sessionstart</span>
            <span className="text-primary font-medium">{summary.sessionStart}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Öppningskassa</span>
            <span className="text-primary font-medium">{summary.openingFloat} kr</span>
          </div>

          <hr className="border-border" />

          <div className="flex justify-between text-sm">
            <span className="text-muted">💳 Kort</span>
            <span className="text-primary font-medium">{summary.cardTotal} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">📱 Swish</span>
            <span className="text-primary font-medium">{summary.swishTotal} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">💵 Kontant</span>
            <span className="text-primary font-medium">{summary.cashTotal} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">🎁 Frikort</span>
            <span className="text-primary font-medium">{summary.compTotal} kr</span>
          </div>

          <hr className="border-border" />

          <div className="flex justify-between text-base font-bold">
            <span>Totalt</span>
            <span>{grandTotal} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Antal transaktioner</span>
            <span className="text-primary font-medium">{summary.transactionCount}</span>
          </div>

          <hr className="border-border" />

          <div>
            <label className="text-sm font-medium text-primary block mb-1">Stäng kassa — räknad kontant</label>
            <input
              type="number"
              placeholder="Ange belopp"
              className="flex h-12 w-full rounded-lg border border-border bg-surface px-3 text-base focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <a href="/pos" className="flex-1 h-12 rounded-lg border border-border text-primary font-medium text-center leading-[48px] hover:bg-gray-50">
            Tillbaka
          </a>
          <button className="flex-1 h-12 rounded-lg bg-error text-white font-medium hover:bg-red-700 transition-colors">
            Stäng session
          </button>
        </div>
      </div>
    </div>
  );
}
