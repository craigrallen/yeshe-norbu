'use client';

import * as React from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '../lib/cn';

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000];

export interface DonationWidgetProps {
  locale: 'sv' | 'en';
  onDonate?: (amount: number, recurring: boolean) => void;
  className?: string;
}

const t = {
  sv: {
    title: 'Stöd Yeshe Norbu',
    oneTime: 'Engångsgåva',
    monthly: 'Månadsgivare',
    custom: 'Annat belopp',
    donate: 'Donera',
    currency: 'kr',
  },
  en: {
    title: 'Support Yeshe Norbu',
    oneTime: 'One-time',
    monthly: 'Monthly',
    custom: 'Other amount',
    donate: 'Donate',
    currency: 'kr',
  },
};

/** Donation amount selector with one-time / monthly toggle. */
export function DonationWidget({ locale = 'sv', onDonate, className }: DonationWidgetProps) {
  const s = t[locale];
  const [amount, setAmount] = React.useState<number | null>(250);
  const [customAmount, setCustomAmount] = React.useState('');
  const [recurring, setRecurring] = React.useState(false);

  const effectiveAmount = amount ?? (customAmount ? parseInt(customAmount, 10) : 0);

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-primary">{s.title}</h3>

      {/* Recurring toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            !recurring ? 'bg-brand text-white' : 'bg-surface text-primary hover:bg-gray-50',
          )}
          onClick={() => setRecurring(false)}
          type="button"
        >
          {s.oneTime}
        </button>
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            recurring ? 'bg-brand text-white' : 'bg-surface text-primary hover:bg-gray-50',
          )}
          onClick={() => setRecurring(true)}
          type="button"
        >
          {s.monthly}
        </button>
      </div>

      {/* Amount buttons */}
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTED_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            className={cn(
              'rounded-lg border py-3 text-sm font-medium transition-colors',
              amount === a
                ? 'border-brand bg-brand/10 text-brand-dark'
                : 'border-border text-primary hover:border-brand/50',
            )}
            onClick={() => { setAmount(a); setCustomAmount(''); }}
          >
            {a} {s.currency}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <Input
        placeholder={s.custom}
        type="number"
        min={1}
        value={customAmount}
        onChange={(e) => {
          setCustomAmount(e.target.value);
          setAmount(null);
        }}
      />

      <Button
        className="w-full"
        size="lg"
        disabled={!effectiveAmount || effectiveAmount <= 0}
        onClick={() => onDonate?.(effectiveAmount, recurring)}
      >
        {s.donate} {effectiveAmount > 0 ? `${effectiveAmount} ${s.currency}` : ''}
      </Button>
    </div>
  );
}
