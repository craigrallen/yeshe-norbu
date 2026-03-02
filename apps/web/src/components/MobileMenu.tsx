'use client';

import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

interface NavChild { href: string; label: string; }
interface NavItem { href: string; label: string; children?: NavChild[]; }

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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

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
        <div className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#3D3D3D] shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {items.map((item) => (
              <div key={item.href}>
                {item.children?.length ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-900 dark:text-[#E8E4DE] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${expandedItems.has(item.href) ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedItems.has(item.href) && (
                      <div className="ml-4 border-l-2 border-[#E8E4DE] dark:border-[#3D3D3D] pl-2 flex flex-col gap-0.5 mb-1">
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="px-4 py-2.5 text-sm text-gray-700 dark:text-[#C0BAB0] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base font-medium text-gray-900 dark:text-[#E8E4DE] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-lg transition-colors block"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-[#3D3D3D] my-2" />
            <div className="px-2 py-1"><ThemeToggle /></div>
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
