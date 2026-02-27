'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../lib/cn';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Accessible radio group built on Radix UI. */
export function RadioGroup({ label, options, value, onValueChange, className }: RadioGroupProps) {
  return (
    <fieldset className={className}>
      {label && <legend className="mb-2 text-sm font-medium text-primary">{label}</legend>}
      <RadioGroupPrimitive.Root value={value} onValueChange={onValueChange} className="space-y-2">
        {options.map((opt) => {
          const id = `radio-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupPrimitive.Item
                id={id}
                value={opt.value}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand"
              >
                <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-brand" />
              </RadioGroupPrimitive.Item>
              <label htmlFor={id} className="text-sm text-primary cursor-pointer">
                {opt.label}
              </label>
            </div>
          );
        })}
      </RadioGroupPrimitive.Root>
    </fieldset>
  );
}
