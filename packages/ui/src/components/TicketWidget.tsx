'use client';

import * as React from 'react';
import { Button } from './Button';
import { cn } from '../lib/cn';

export interface TicketType {
  id: string;
  name: string;
  priceSek: number;
  available: number;
}

export interface TicketWidgetProps {
  locale: 'sv' | 'en';
  tickets: TicketType[];
  onCheckout?: (selections: Record<string, number>) => void;
  className?: string;
}

const t = {
  sv: { soldOut: 'Slutsåld', checkout: 'Till kassan', total: 'Totalt', free: 'Gratis' },
  en: { soldOut: 'Sold out', checkout: 'Checkout', total: 'Total', free: 'Free' },
};

/** Ticket quantity selector for event pages. */
export function TicketWidget({ locale = 'sv', tickets, onCheckout, className }: TicketWidgetProps) {
  const s = t[locale];
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const total = tickets.reduce((sum, ticket) => {
    return sum + (quantities[ticket.id] ?? 0) * ticket.priceSek;
  }, 0);

  const hasSelection = Object.values(quantities).some((q) => q > 0);

  function updateQty(id: string, delta: number) {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const ticket = tickets.find((t) => t.id === id);
      const max = ticket?.available ?? 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [id]: next };
    });
  }

  return (
    <div className={cn('space-y-3', className)}>
      {tickets.map((ticket) => {
        const qty = quantities[ticket.id] ?? 0;
        const soldOut = ticket.available <= 0;
        return (
          <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-primary">{ticket.name}</p>
              <p className="text-sm text-muted">
                {ticket.priceSek > 0 ? `${ticket.priceSek} kr` : s.free}
              </p>
            </div>
            {soldOut ? (
              <span className="text-sm text-error">{s.soldOut}</span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-border text-primary hover:bg-gray-50 disabled:opacity-30"
                  onClick={() => updateQty(ticket.id, -1)}
                  disabled={qty === 0}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full border border-border text-primary hover:bg-gray-50 disabled:opacity-30"
                  onClick={() => updateQty(ticket.id, 1)}
                  disabled={qty >= ticket.available}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}

      {hasSelection && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-medium text-primary">{s.total}: {total} kr</span>
          <Button onClick={() => onCheckout?.(quantities)}>{s.checkout}</Button>
        </div>
      )}
    </div>
  );
}
