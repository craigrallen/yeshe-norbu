import { requireAdmin } from '@/lib/authz';

const adminNav = [
  { href: '/admin', label: 'Översikt', labelEn: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Användare', labelEn: 'Users', icon: '👥' },
  { href: '/admin/members', label: 'Medlemmar', labelEn: 'Members', icon: '🪪' },
  { href: '/admin/events', label: 'Evenemang', labelEn: 'Events', icon: '📅' },
  { href: '/admin/orders', label: 'Beställningar', labelEn: 'Orders', icon: '🛍️' },
  { href: '/admin/blog', label: 'Blogg', labelEn: 'Blog', icon: '✍️' },
  { href: '/admin/venues', label: 'Platser', labelEn: 'Venues', icon: '📍' },
  { href: '/admin/organizers', label: 'Arrangörer', labelEn: 'Organizers', icon: '🎤' },
];

export default async function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  return (
    <div className="min-h-screen bg-gray-50 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Admin top bar */}
      <div className="bg-gray-900 text-white px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <span className="text-xs md:text-sm font-medium text-gray-400 truncate">{sv ? 'Admin' : 'Admin'}</span>
          <span className="text-gray-600 hidden md:inline">|</span>
          <span className="text-xs md:text-sm text-white font-semibold truncate">Yeshin Norbu</span>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/${locale}`} className="text-xs text-gray-400 hover:text-white whitespace-nowrap">{sv ? '← Sajten' : '← Site'}</a>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">A</div>
        </div>
      </div>

      {/* Mobile nav — sits OUTSIDE the flex row */}
      <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {adminNav.map((item) => (
            <a key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap">
              <span>{item.icon}</span>
              <span>{sv ? item.label : item.labelEn}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6 hidden md:block shrink-0">
          <nav className="px-3 space-y-1">
            {adminNav.map((item) => (
              <a
                key={item.href}
                href={`/${locale}${item.href}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{sv ? item.label : item.labelEn}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
