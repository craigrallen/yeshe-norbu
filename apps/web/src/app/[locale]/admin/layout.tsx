const adminNav = [
  { href: '/admin', label: 'Översikt', labelEn: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Användare', labelEn: 'Users', icon: '👥' },
  { href: '/admin/members', label: 'Medlemmar', labelEn: 'Members', icon: '🪪' },
  { href: '/admin/events', label: 'Evenemang', labelEn: 'Events', icon: '📅' },
  { href: '/admin/orders', label: 'Beställningar', labelEn: 'Orders', icon: '🛍️' },
  { href: '/admin/blog', label: 'Blogg', labelEn: 'Blog', icon: '✍️' },
];

export default function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const sv = locale === 'sv';

  return (
    <div className="min-h-screen bg-gray-50 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Admin top bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-400">{sv ? 'Administrationspanel' : 'Admin Panel'}</span>
          <span className="text-gray-600">|</span>
          <span className="text-sm text-white font-semibold">Yeshin Norbu</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/${locale}`} className="text-xs text-gray-400 hover:text-white">{sv ? '← Tillbaka till sajten' : '← Back to site'}</a>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">A</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6 hidden md:block">
          <nav className="px-3 space-y-1">
            {adminNav.map((item) => (
              <a
                key={item.href}
                href={`/${locale}${item.href}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{sv ? item.label : item.labelEn}</span>
              </a>
            ))}
          </nav>

          <div className="mt-8 mx-3 px-3 py-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-700 mb-1">{sv ? 'Databas' : 'Database'}</p>
            <p className="text-xs text-blue-600">1,191 {sv ? 'användare' : 'users'}</p>
            <p className="text-xs text-blue-600">852 {sv ? 'medlemmar' : 'members'}</p>
            <p className="text-xs text-blue-600">215 {sv ? 'evenemang' : 'events'}</p>
          </div>
        </aside>

        {/* Mobile admin nav */}
        <div className="md:hidden w-full bg-white border-b border-gray-200 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {adminNav.map((item) => (
              <a key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap">
                <span>{item.icon}</span>
                <span>{sv ? item.label : item.labelEn}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
