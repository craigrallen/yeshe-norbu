'use client';

import { useState } from 'react';

interface AnnouncementBannerProps {
  text: string;
  color?: string;
}

export function AnnouncementBanner({ text, color = '#E8B817' }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!text || dismissed) return null;

  return (
    <div
      className="relative z-40 px-4 py-2 text-center text-sm font-medium"
      style={{ backgroundColor: color, color: '#1a1a1a' }}
    >
      <span>{text}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Stäng / Close"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
