import { requireAdmin } from '@/lib/authz';
import { SiteIcon } from '@/components/site-icon';

type IconName = 'dashboard'|'users'|'member'|'events'|'venue'|'organizer'|'settings'|'orders'|'products'|'blog';
type NavItem = { href: string; label: string; labelEn: string; icon: IconName; children?: NavItem[] };

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Översikt', labelEn: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/users', label: 'Användare', labelEn: 'Users', icon: 'users' },
  { href: '/admin/members', label: 'Medlemmar', labelEn: 'Members', icon: 'member' },
  { href: '/admin/events', label: 'Evenemang', labelEn: 'Events', icon: 'events', children: [
    { href: '/admin/events', label: 'Alla evenemang', labelEn: 'All Events', icon: 'events' },
    { href: '/admin/venues', label: 'Platser', labelEn: 'Venues', icon: 'venue' },
    { href: '/admin/organizers', label: 'Arrangörer', labelEn: 'Organizers', icon: 'organizer' },
    { href: '/admin/events/settings', label: 'Eventinställningar', labelEn: 'Event Settings', icon: 'settings' },
  ]},
  { href: '/admin/orders', label: 'Beställningar', labelEn: 'Orders', icon: 'orders' },
  { href: '/admin/products', label: 'Produkter', labelEn: 'Products', icon: 'products' },
  { href: '/admin/blog', label: 'Blogg', labelEn: 'Blog', icon: 'blog' },
];

function SidebarItem({ item, locale, sv }: { item: NavItem; locale: string; sv: boolean }) {
  if (item.children) {
    return (
      <div>
        <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 uppercase tracking-wider text-xs mt-3">
          <SiteIcon name={item.icon} className="w-4 h-4" />
          <span>{sv ? item.label : item.labelEn}</span>
        </div>
        <div className="ml-4 space-y-0.5">
          {item.children.map((child) => (
            <a key={child.href} href={`/${locale}${child.href}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <SiteIcon name={child.icon} className="w-4 h-4" />
              <span>{sv ? child.label : child.labelEn}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }
  return (
    <a href={`/${locale}${item.href}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
      <SiteIcon name={item.icon} className="w-4 h-4" />
      <span>{sv ? item.label : item.labelEn}</span>
    </a>
  );
}

const mobileNav = adminNav.flatMap(item => item.children ? item.children : [item]);

export default async function AdminLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  return (
    <div className="min-h-screen bg-gray-50 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="bg-gray-900 text-white px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <span className="text-xs md:text-sm font-medium text-gray-400 truncate">Admin</span>
          <span className="text-gray-600 hidden md:inline">|</span>
          <span className="text-xs md:text-sm text-white font-semibold truncate">Yeshin Norbu</span>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/${locale}`} className="text-xs text-gray-400 hover:text-white whitespace-nowrap">{sv ? '← Sajten' : '← Site'}</a>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">A</div>
        </div>
      </div>

      <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {mobileNav.map((item) => (
            <a key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap">
              <SiteIcon name={item.icon} className="w-3.5 h-3.5" />
              <span>{sv ? item.label : item.labelEn}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6 hidden md:block shrink-0">
          <nav className="px-3 space-y-0.5">{adminNav.map((item) => <SidebarItem key={item.href + (item.children ? '-group' : '')} item={item} locale={locale} sv={sv} />)}</nav>
        </aside>
        <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
