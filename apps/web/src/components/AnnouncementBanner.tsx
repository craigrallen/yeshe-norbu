'use client';

import { useState, useEffect } from 'react';

interface AnnouncementBannerProps {
  text: string;
  color?: string;
}

export function AnnouncementBanner({ text, color = '#E8B817' }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // When banner is visible, push the fixed header and main content down
  useEffect(() => {
    if (!text || dismissed) {
      document.documentElement.style.removeProperty('--banner-height');
      return;
    }
    const banner = document.getElementById('announcement-banner');
    if (banner) {
      const h = banner.offsetHeight;
      document.documentElement.style.setProperty('--banner-height', `${h}px`);
    }
    return () => { document.documentElement.style.removeProperty('--banner-height'); };
  }, [text, dismissed]);

  if (!text || dismissed) return null;

  return (
    <div
      id="announcement-banner"
      className="announcement-banner fixed top-0 left-0 right-0 z-[60] px-4 py-2.5 text-center text-sm font-medium"
      style={{ backgroundColor: color, color: '#1a1a1a' }}
    >
      <span>{text}</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
