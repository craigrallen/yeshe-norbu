'use client';

import { useState } from 'react';

interface NavItem { href: string; label: string; }

export function MobileMenu({ items, locale, loginLabel, logoutLabel, langLabel, langHref, isLoggedIn, showAdmin }: {
  items: NavItem[];
  locale: string;
  loginLabel: string;
  logoutLabel: string;
  langLabel: string;
  langHref: string;
  isLoggedIn: boolean;
  showAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-primary hover:bg-gray-100 transition-colors"
        aria-label={open ? 'Stäng meny' : 'Öppna meny'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <a
              href={langHref}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {langLabel}
            </a>
            <a
              href={isLoggedIn ? `/api/auth/logout?next=/${locale}` : `/${locale}/logga-in`}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-base font-medium text-yellow-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isLoggedIn ? logoutLabel : loginLabel}
            </a>
            {showAdmin && (
              <a
                href={`/${locale}/admin`}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Admin
              </a>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
