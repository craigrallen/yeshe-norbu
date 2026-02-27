'use client';

import * as React from 'react';
import { cn } from '../lib/cn';

export interface NavItem {
  href: string;
  label: string;
}

export interface NavigationProps {
  items: NavItem[];
  locale: 'sv' | 'en';
  currentPath: string;
  onLocaleChange?: (locale: 'sv' | 'en') => void;
  className?: string;
}

/** Desktop + mobile navigation with language switcher. */
export function Navigation({ items, locale, currentPath, onLocaleChange, className }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <nav className={cn('relative', className)} aria-label="Main navigation">
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-brand',
              currentPath === item.href ? 'text-brand' : 'text-primary',
            )}
            aria-current={currentPath === item.href ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
        <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 z-50 md:hidden bg-surface border border-border rounded-lg shadow-lg mt-2 p-4">
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium py-2 px-3 rounded transition-colors hover:bg-gray-50',
                  currentPath === item.href ? 'text-brand bg-brand/5' : 'text-primary',
                )}
                aria-current={currentPath === item.href ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-border">
              <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function LanguageSwitcher({ locale, onChange }: { locale: 'sv' | 'en'; onChange?: (l: 'sv' | 'en') => void }) {
  return (
    <button
      onClick={() => onChange?.(locale === 'sv' ? 'en' : 'sv')}
      className="text-sm text-muted hover:text-primary transition-colors px-2 py-1 rounded border border-border"
      aria-label={locale === 'sv' ? 'Switch to English' : 'Byt till svenska'}
    >
      {locale === 'sv' ? 'EN' : 'SV'}
    </button>
  );
}
