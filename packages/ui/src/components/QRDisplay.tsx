'use client';

import * as React from 'react';
import { cn } from '../lib/cn';

export interface QRDisplayProps {
  /** Data URL or image URL of the QR code */
  qrCodeUrl: string;
  /** Label shown below the QR code */
  label?: string;
  /** Size in pixels */
  size?: number;
  className?: string;
}

/** Display a QR code image with an optional label. Used for Swish payments and check-in. */
export function QRDisplay({ qrCodeUrl, label, size = 200, className }: QRDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <img
        src={qrCodeUrl}
        alt={label ?? 'QR Code'}
        width={size}
        height={size}
        className="rounded-lg"
      />
      {label && <p className="text-sm text-muted text-center">{label}</p>}
    </div>
  );
}
