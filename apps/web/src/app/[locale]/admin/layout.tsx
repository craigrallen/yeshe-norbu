import { Pool } from 'pg';
import { AdminSidebar } from '@/components/AdminSidebar';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SiteIcon } from '@/components/site-icon';
import { ThemeToggle } from '@/components/ThemeToggle';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type IconName = 'dashboard'|'users'|'member'|'events'|'venue'|'organizer'|'settings'|'orders'|'products'|'blog'|'media';
type NavItem = { href: string; label: string; labelEn: string; icon: IconName; adminOnly?: boolean; children?: NavItem[] };

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Översikt', labelEn: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/users', label: 'Användare', labelEn: 'Users', icon: 'users', adminOnly: true },
  { href: '/admin/members', label: 'Medlemmar', labelEn: 'Members', icon: 'member', adminOnly: true },
  { href: '/admin/events', label: 'Evenemang', labelEn: 'Events', icon: 'events', children: [
    { href: '/admin/events', label: 'Alla evenemang', labelEn: 'All Events', icon: 'events' },
    { href: '/admin/venues', label: 'Platser', labelEn: 'Venues', icon: 'venue' },
    { href: '/admin/organizers', label: 'Arrangörer', labelEn: 'Organizers', icon: 'organizer' },
    { href: '/admin/events/settings', label: 'Eventinställningar', labelEn: 'Event Settings', icon: 'settings' },
  ]},
  { href: '/admin/orders', label: 'Beställningar', labelEn: 'Orders', icon: 'orders', adminOnly: true },
  { href: '/admin/products', label: 'Produkter', labelEn: 'Products', icon: 'products', adminOnly: true },
  { href: '/admin/blog', label: 'Blogg', labelEn: 'Blog', icon: 'blog', adminOnly: true },
  { href: '/admin/pages', label: 'Sidor', labelEn: 'Pages', icon: 'blog' as any, adminOnly: true },
  { href: '/admin/media', label: 'Media', labelEn: 'Media', icon: 'blog' as any },
  { href: '/admin/settings', label: 'Inställningar', labelEn: 'Settings', icon: 'settings', adminOnly: true },
  { href: '/admin/audit-log', label: 'Aktivitetslogg', labelEn: 'Audit Log', icon: 'book' as any, adminOnly: true },
];


export default async function AdminLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const sv = locale === 'sv';

  const session = await getSession();
  if (!session?.userId) redirect(`/${locale}/logga-in`);

  let userRole = 'none';
  try {
    const { rows } = await pool.query(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role IN ('admin','editor','event_manager','finance','support','cashier') ORDER BY
        CASE role WHEN 'admin' THEN 1 WHEN 'editor' THEN 2 WHEN 'finance' THEN 3 WHEN 'support' THEN 4 WHEN 'event_manager' THEN 5 ELSE 6 END LIMIT 1`,
      [session.userId]
    );
    userRole = rows[0]?.role || 'none';
  } catch {
    // DB unavailable locally — allow through in dev
    userRole = 'admin';
  }
  if (userRole === 'none') redirect(`/${locale}/konto`);

  const isAdmin = ['admin', 'editor', 'finance', 'support'].includes(userRole);
  const filteredNav = adminNav.filter(item => isAdmin || !item.adminOnly);
  const mobileNav = filteredNav.flatMap(item => item.children ? item.children : [item]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hide public site header/footer and reset padding when in admin */}
      <style dangerouslySetInnerHTML={{ __html: `
        body > div > header.fixed { display: none !important; }
        body > div > footer { display: none !important; }
        #main-content { padding-top: 0 !important; }
        body > div > .announcement-banner { display: none !important; }
        body > div > .cookie-consent { display: none !important; }
        body > div > .back-to-top { display: none !important; }
      ` }} />
      <div className="bg-gray-900 dark:bg-gray-950 text-white px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <span className="text-xs md:text-sm font-medium text-gray-400 truncate">Admin</span>
          <span className="text-gray-600 hidden md:inline">|</span>
          <span className="text-xs md:text-sm text-white font-semibold truncate">Yeshin Norbu</span>
          {!isAdmin && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-800 rounded-full text-blue-200">{userRole}</span>}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white" />
          <a href={`/${locale}`} className="text-xs text-gray-400 hover:text-white whitespace-nowrap">{sv ? '← Sajten' : '← Site'}</a>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#E8B817] flex items-center justify-center text-xs md:text-sm font-bold shrink-0 text-white">A</div>
        </div>
      </div>

      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {mobileNav.map((item) => (
            <a key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap">
              <SiteIcon name={item.icon} className="w-3.5 h-3.5" />
              <span>{sv ? item.label : item.labelEn}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-6 hidden md:block shrink-0">
          <AdminSidebar nav={filteredNav as any} locale={locale} sv={sv} />
        </aside>
        <main className="flex-1 min-w-0 overflow-x-auto p-6">{children}</main>
      </div>
    </div>
  );
}
