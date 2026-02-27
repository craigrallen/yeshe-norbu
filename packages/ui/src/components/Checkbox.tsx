'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../lib/cn.js';

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Accessible checkbox with label. */
export function Checkbox({ label, checked, onCheckedChange, disabled, className }: CheckboxProps) {
  const id = React.useId();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="flex h-5 w-5 items-center justify-center rounded border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:bg-brand data-[state=checked]:border-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckboxPrimitive.Indicator>
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={id} className="text-sm text-primary cursor-pointer">
        {label}
      </label>
    </div>
  );
}
