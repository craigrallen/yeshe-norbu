'use client';

import { usePathname } from 'next/navigation';
import { SiteIcon } from '@/components/site-icon';

type IconName = 'dashboard'|'users'|'member'|'events'|'venue'|'organizer'|'settings'|'orders'|'products'|'blog'|'media';
type NavItem = { href: string; label: string; labelEn: string; icon: IconName; children?: NavItem[] };

export function AdminSidebar({ nav, locale, sv }: { nav: NavItem[]; locale: string; sv: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    if (href === '/admin') return pathname === full;
    return pathname.startsWith(full);
  };

  function Item({ item }: { item: NavItem }) {
    if (item.children) {
      return (
        <div>
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-4">
            <SiteIcon name={item.icon} className="w-3.5 h-3.5" />
            <span>{sv ? item.label : item.labelEn}</span>
          </div>
          <div className="ml-1 space-y-0.5">
            {item.children.map((child) => (
              <a
                key={child.href}
                href={`/${locale}${child.href}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(child.href)
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <SiteIcon name={child.icon} className="w-4 h-4 shrink-0" />
                <span>{sv ? child.label : child.labelEn}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }
    return (
      <a
        href={`/${locale}${item.href}`}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive(item.href)
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <SiteIcon name={item.icon} className="w-4 h-4 shrink-0" />
        <span>{sv ? item.label : item.labelEn}</span>
      </a>
    );
  }

  return (
    <nav className="px-3 space-y-0.5">
      {nav.map((item) => <Item key={item.href + (item.children ? '-group' : '')} item={item} />)}
    </nav>
  );
}
