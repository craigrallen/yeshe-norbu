'use client';

import { useState, useRef } from 'react';

interface NavChild { href: string; label: string; }
interface NavItemWithChildren { href: string; label: string; children?: NavChild[]; }

export function NavItemDropdown({ item }: { item: NavItemWithChildren }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!item.children?.length) {
    return (
      <a href={item.href} className="text-[14px] font-medium text-charcoal dark:text-[#E8E4DE] hover:text-brand-dark transition-colors tracking-wide">
        {item.label}
      </a>
    );
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <a
        href={item.href}
        className="flex items-center gap-1 text-[14px] font-medium text-charcoal dark:text-[#E8E4DE] hover:text-brand-dark transition-colors tracking-wide"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[180px] bg-white dark:bg-[#242424] border border-[#E8E4DE] dark:border-[#3D3D3D] rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
        role="menu"
      >
        {item.children.map((child) => (
          <a
            key={child.href}
            href={child.href}
            role="menuitem"
            className="block px-4 py-2.5 text-[13px] text-charcoal dark:text-[#E8E4DE] hover:bg-[#F9F7F4] dark:hover:bg-[#2A2A2A] hover:text-brand-dark transition-colors whitespace-nowrap"
          >
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}
