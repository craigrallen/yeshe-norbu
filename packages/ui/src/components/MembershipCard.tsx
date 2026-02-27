'use client';

import * as React from 'react';
import { Card } from './Card.js';
import { Button } from './Button.js';
import { cn } from '../lib/cn.js';

export interface MembershipCardProps {
  name: string;
  priceSek: string;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  onSelect?: () => void;
  className?: string;
}

/** Membership tier card for the membership page. */
export function MembershipCard({
  name, priceSek, interval, description, features, highlighted, ctaLabel, onSelect, className,
}: MembershipCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col',
        highlighted && 'border-brand ring-2 ring-brand/20',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">{name}</h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold text-primary">{priceSek}</span>
        <span className="text-sm text-muted ml-1">kr / {interval}</span>
      </div>
      <ul className="space-y-2 mb-6 flex-1" role="list">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-primary">
            <svg className="h-5 w-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? 'primary' : 'outline'}
        className="w-full"
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}
