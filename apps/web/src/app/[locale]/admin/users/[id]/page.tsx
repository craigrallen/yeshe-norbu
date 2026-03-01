import { createHash } from 'crypto';
import {
  createDb, users, userRoles, memberships, membershipPlans, orders, payments,
  courseEnrollments, courses, eventRegistrations, events, eventCategories,
} from '@yeshe/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

const PREVIEW = 10;

async function saveUser(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const locale = String(formData.get('locale') || 'sv');
  await db.update(users).set({
    firstName: String(formData.get('firstName') || '').trim() || null,
    lastName: String(formData.get('lastName') || '').trim() || null,
    email: String(formData.get('email') || '').trim().toLowerCase(),
    phone: String(formData.get('phone') || '').trim() || null,
    locale: String(formData.get('userLocale') || 'sv').trim(),
    consentMarketing: formData.get('consentMarketing') === 'on',
    emailVerified: formData.get('emailVerified') === 'on',
    updatedAt: new Date(),
  }).where(eq(users.id, id));

  const existing = await db.select().from(userRoles).where(eq(userRoles.userId, id));
  const hasAdmin = existing.some(r => r.role === 'admin');
  const isAdmin = formData.get('isAdmin') === 'on';
  if (isAdmin && !hasAdmin) await db.insert(userRoles).values({ userId: id, role: 'admin' as any });
  if (!isAdmin && hasAdmin) await db.delete(userRoles).where(sql`${userRoles.userId} = ${id} AND ${userRoles.role} = 'admin'`);

  revalidatePath(`/${locale}/admin/users`);
  revalidatePath(`/${locale}/admin/users/${id}`);
}

async function getMailchimpData(email: string) {
  const key = process.env.MAILCHIMP_API_KEY || '';
  const audience = process.env.MAILCHIMP_AUDIENCE_ID || '';
  const server = process.env.MAILCHIMP_SERVER_PREFIX || (key.includes('-') ? key.split('-').pop() : '');
  if (!key || !audience || !server) return { configured: false as const };
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  const base = `https://${server}.api.mailchimp.com/3.0/lists/${audience}/members/${hash}`;
  try {
    const [memberRes, tagsRes] = await Promise.all([
      fetch(base, { headers: { Authorization: `apikey ${key}` }, cache: 'no-store' }),
      fetch(`${base}/tags`, { headers: { Authorization: `apikey ${key}` }, cache: 'no-store' }),
    ]);
    if (!memberRes.ok) return { configured: true as const, found: false as const };
    const member = await memberRes.json();
    const tagsJson = tagsRes.ok ? await tagsRes.json() : { tags: [] };
    return {
      configured: true as const, found: true as const, status: member.status,
      memberRating: member.member_rating, language: member.language, vip: member.vip,
      lastChanged: member.last_changed, tags: (tagsJson.tags || []).filter((t: any) => t.status === 'active').map((t: any) => t.name),
    };
  } catch { return { configured: true as const, found: false as const }; }
}

export default async function UserDetailPage({
  params: { locale, id }, searchParams,
}: { params: { locale: string; id: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);
  const showAll = String(searchParams?.showAll || '');

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">Not found</h1></div>;

  const roles = await db.select().from(userRoles).where(eq(userRoles.userId, id));
  const isAdmin = roles.some(r => r.role === 'admin');

  // Orders
  const [ordersCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.userId, id));
  const ordersCount = ordersCountRow?.count || 0;
  const userOrders = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, totalSek: orders.totalSek, status: orders.status, channel: orders.channel, createdAt: orders.createdAt })
    .from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)).limit(showAll === 'orders' ? 9999 : PREVIEW);

  // Memberships
  const mems = await db
    .select({ id: memberships.id, status: memberships.status, periodStart: memberships.currentPeriodStart, periodEnd: memberships.currentPeriodEnd, planName: membershipPlans.nameSv, planNameEn: membershipPlans.nameEn, createdAt: memberships.createdAt })
    .from(memberships).leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .where(eq(memberships.userId, id)).orderBy(desc(memberships.createdAt));
  const isMember = mems.some(m => m.status === 'active');
  const memsDisplay = showAll === 'memberships' ? mems : mems.slice(0, PREVIEW);

  // Payments
  const [paymentsCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(payments).leftJoin(orders, eq(payments.orderId, orders.id)).where(eq(orders.userId, id));
  const paymentsCount = paymentsCountRow?.count || 0;
  const userPayments = await db
    .select({ id: payments.id, orderId: payments.orderId, method: payments.method, status: payments.status, amountSek: payments.amountSek, createdAt: payments.createdAt, orderNumber: orders.orderNumber })
    .from(payments).leftJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(orders.userId, id)).orderBy(desc(payments.createdAt)).limit(showAll === 'payments' ? 9999 : PREVIEW);

  // Events attended
  const [eventsCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(eventRegistrations).where(eq(eventRegistrations.userId, id));
  const eventsCount = eventsCountRow?.count || 0;
  const attendedEvents = await db
    .select({ id: eventRegistrations.id, checkedInAt: eventRegistrations.checkedInAt, createdAt: eventRegistrations.createdAt, eventTitleSv: events.titleSv, eventTitleEn: events.titleEn, categorySv: eventCategories.nameSv, categoryEn: eventCategories.nameEn, startsAt: events.startsAt, orderId: eventRegistrations.orderId })
    .from(eventRegistrations).leftJoin(events, eq(eventRegistrations.eventId, events.id)).leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
    .where(eq(eventRegistrations.userId, id)).orderBy(desc(eventRegistrations.createdAt)).limit(showAll === 'events' ? 9999 : PREVIEW);

  // Courses
  const enrolledCourses = await db
    .select({ id: courseEnrollments.id, completedAt: courseEnrollments.completedAt, createdAt: courseEnrollments.createdAt, titleSv: courses.titleSv, titleEn: courses.titleEn, orderId: courseEnrollments.orderId })
    .from(courseEnrollments).leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, id)).orderBy(desc(courseEnrollments.createdAt));
  const coursesDisplay = showAll === 'courses' ? enrolledCourses : enrolledCourses.slice(0, PREVIEW);

  // Stats
  const [stats] = await db.select({ totalOrders: sql<number>`count(*)::int`, totalSpend: sql<string>`coalesce(sum(${orders.totalSek}), 0)::text`, avgOrder: sql<string>`coalesce(avg(${orders.totalSek}), 0)::text` }).from(orders).where(eq(orders.userId, id));
  const lastOrderAt = userOrders[0]?.createdAt || null;
  const lastEventAt = attendedEvents[0]?.createdAt || null;
  const lastActivity = [lastOrderAt, enrolledCourses[0]?.createdAt, lastEventAt].filter(Boolean).sort((a: any, b: any) => +new Date(b) - +new Date(a))[0];
  const inactiveDays = lastActivity ? Math.floor((Date.now() - +new Date(lastActivity)) / 86400000) : null;

  const topCatMap = new Map<string, number>();
  attendedEvents.forEach((e: any) => { const k = (sv ? e.categorySv : e.categoryEn) || '—'; topCatMap.set(k, (topCatMap.get(k) || 0) + 1); });
  const topCats = Array.from(topCatMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const mailchimp = await getMailchimpData(user.email);

  const statusColor: Record<string, string> = { confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', failed: 'bg-red-100 text-red-800', refunded: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-600', succeeded: 'bg-green-100 text-green-800', active: 'bg-green-100 text-green-800', expired: 'bg-gray-100 text-gray-600', paused: 'bg-yellow-100 text-yellow-800' };
  const viewAllHref = (section: string) => `/${locale}/admin/users/${id}?showAll=${section}`;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <a href={`/${locale}/admin/users`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla kunder' : 'All customers'}</a>

      {/* Profile form */}
      <form action={saveUser} className="bg-white rounded-xl border p-6 space-y-4">
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="locale" value={locale} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-400 text-xs mt-1">ID: {user.id}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">admin</span>}
            {isMember && <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">member</span>}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div><label className="block text-gray-500 mb-1">{sv ? 'Förnamn' : 'First name'}</label><input name="firstName" defaultValue={user.firstName || ''} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="block text-gray-500 mb-1">{sv ? 'Efternamn' : 'Last name'}</label><input name="lastName" defaultValue={user.lastName || ''} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="block text-gray-500 mb-1">Email</label><input name="email" type="email" defaultValue={user.email} className="w-full border rounded px-3 py-2" required /></div>
          <div><label className="block text-gray-500 mb-1">{sv ? 'Telefon' : 'Phone'}</label><input name="phone" defaultValue={user.phone || ''} className="w-full border rounded px-3 py-2" /></div>
          <div><label className="block text-gray-500 mb-1">{sv ? 'Språk' : 'Locale'}</label><select name="userLocale" defaultValue={user.locale} className="w-full border rounded px-3 py-2"><option value="sv">sv</option><option value="en">en</option></select></div>
          <div><label className="block text-gray-500 mb-1">Stripe</label><div className="py-2 text-sm text-gray-600">{user.stripeCustomerId || '—'}</div></div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="emailVerified" defaultChecked={Boolean(user.emailVerified)} /> {sv ? 'E-post verifierad' : 'Email verified'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="consentMarketing" defaultChecked={Boolean(user.consentMarketing)} /> {sv ? 'Marknadsföring' : 'Marketing'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isAdmin" defaultChecked={isAdmin} /> Admin</label>
        </div>
        <button className="px-5 py-2 rounded-lg bg-[#58595b] text-white">{sv ? 'Spara' : 'Save'}</button>
      </form>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-white px-4 py-3"><p className="text-[11px] text-gray-400 uppercase">{sv ? 'Ordrar' : 'Orders'}</p><p className="text-2xl font-bold">{stats?.totalOrders || 0}</p></div>
        <div className="rounded-xl border bg-white px-4 py-3"><p className="text-[11px] text-gray-400 uppercase">{sv ? 'Omsättning' : 'Spend'}</p><p className="text-2xl font-bold">{Math.round(Number(stats?.totalSpend || 0))} kr</p></div>
        <div className="rounded-xl border bg-white px-4 py-3"><p className="text-[11px] text-gray-400 uppercase">{sv ? 'Snitt' : 'Avg'}</p><p className="text-2xl font-bold">{Math.round(Number(stats?.avgOrder || 0))} kr</p></div>
        <div className="rounded-xl border bg-white px-4 py-3"><p className="text-[11px] text-gray-400 uppercase">{sv ? 'Inaktiv' : 'Inactive'}</p><p className="text-2xl font-bold">{inactiveDays === null ? '—' : `${inactiveDays}d`}</p></div>
      </div>

      {/* Engagement + Mailchimp side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">{sv ? 'Engagemang' : 'Engagement'}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs">{sv ? 'Senaste aktivitet' : 'Last activity'}</p><p className="font-medium">{lastActivity ? new Date(lastActivity).toLocaleDateString('sv-SE') : '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{sv ? 'Senaste order' : 'Last order'}</p><p className="font-medium">{lastOrderAt ? new Date(lastOrderAt).toLocaleDateString('sv-SE') : '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{sv ? 'Senaste event' : 'Last event'}</p><p className="font-medium">{lastEventAt ? new Date(lastEventAt).toLocaleDateString('sv-SE') : '—'}</p></div>
            <div><p className="text-gray-400 text-xs">{sv ? 'Intressekategorier' : 'Interest categories'}</p><div className="flex flex-wrap gap-1 mt-1">{topCats.length ? topCats.map(([k, n]) => <span key={k} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">{k} ({n})</span>) : <span className="text-gray-400 text-xs">—</span>}</div></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Mailchimp</h2>
          {!mailchimp.configured && <p className="text-sm text-gray-400">{sv ? 'Ej konfigurerad' : 'Not configured'}</p>}
          {mailchimp.configured && !mailchimp.found && <p className="text-sm text-gray-400">{sv ? 'Finns ej i audience' : 'Not in audience'}</p>}
          {mailchimp.configured && mailchimp.found && (
            <div className="space-y-2 text-sm">
              <div className="flex gap-3 flex-wrap"><span>Status: <strong>{mailchimp.status}</strong></span><span>Rating: {mailchimp.memberRating}</span>{mailchimp.vip && <span className="text-amber-600 font-medium">VIP</span>}</div>
              <div className="flex flex-wrap gap-1">{(mailchimp.tags || []).length ? mailchimp.tags.map((t: string) => <span key={t} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px]">{t}</span>) : <span className="text-gray-400">No tags</span>}</div>
            </div>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">{sv ? 'Ordrar' : 'Orders'} <span className="text-gray-400 font-normal">({ordersCount})</span></h2>
          {ordersCount > PREVIEW && showAll !== 'orders' && <a href={viewAllHref('orders')} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'} →</a>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-5 py-2 text-left">#</th>
            <th className="px-5 py-2 text-left">{sv ? 'Belopp' : 'Amount'}</th>
            <th className="px-5 py-2 text-left">Status</th>
            <th className="px-5 py-2 text-left">{sv ? 'Kanal' : 'Channel'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Datum' : 'Date'}</th>
          </tr></thead>
          <tbody className="divide-y">{userOrders.map(o => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-5 py-3"><a href={`/${locale}/admin/orders/${o.id}`} className="text-blue-600 hover:underline font-medium">#{o.orderNumber}</a></td>
              <td className="px-5 py-3 font-medium">{Math.round(Number(o.totalSek))} kr</td>
              <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColor[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
              <td className="px-5 py-3 text-gray-500">{o.channel || '—'}</td>
              <td className="px-5 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('sv-SE')}</td>
            </tr>
          ))}{userOrders.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">{sv ? 'Inga ordrar' : 'No orders'}</td></tr>}</tbody>
        </table>
      </div>

      {/* Memberships */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">{sv ? 'Medlemskap' : 'Memberships'} <span className="text-gray-400 font-normal">({mems.length})</span></h2>
          {mems.length > PREVIEW && showAll !== 'memberships' && <a href={viewAllHref('memberships')} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'} →</a>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-5 py-2 text-left">{sv ? 'Plan' : 'Plan'}</th>
            <th className="px-5 py-2 text-left">Status</th>
            <th className="px-5 py-2 text-left">{sv ? 'Period' : 'Period'}</th>
          </tr></thead>
          <tbody className="divide-y">{memsDisplay.map(m => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{sv ? m.planName : m.planNameEn}</td>
              <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColor[m.status] || 'bg-gray-100'}`}>{m.status}</span></td>
              <td className="px-5 py-3 text-gray-500">{new Date(m.periodStart).toLocaleDateString('sv-SE')} – {new Date(m.periodEnd).toLocaleDateString('sv-SE')}</td>
            </tr>
          ))}{memsDisplay.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400">{sv ? 'Inga medlemskap' : 'No memberships'}</td></tr>}</tbody>
        </table>
      </div>

      {/* Payments */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">{sv ? 'Betalningar' : 'Payments'} <span className="text-gray-400 font-normal">({paymentsCount})</span></h2>
          {paymentsCount > PREVIEW && showAll !== 'payments' && <a href={viewAllHref('payments')} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'} →</a>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-5 py-2 text-left">{sv ? 'Order' : 'Order'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Belopp' : 'Amount'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Metod' : 'Method'}</th>
            <th className="px-5 py-2 text-left">Status</th>
            <th className="px-5 py-2 text-left">{sv ? 'Datum' : 'Date'}</th>
          </tr></thead>
          <tbody className="divide-y">{userPayments.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-5 py-3"><a href={`/${locale}/admin/orders/${p.orderId}`} className="text-blue-600 hover:underline">#{p.orderNumber}</a></td>
              <td className="px-5 py-3 font-medium">{Math.round(Number(p.amountSek))} kr</td>
              <td className="px-5 py-3 text-gray-500">{p.method}</td>
              <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColor[p.status] || 'bg-gray-100'}`}>{p.status}</span></td>
              <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('sv-SE')}</td>
            </tr>
          ))}{userPayments.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">{sv ? 'Inga betalningar' : 'No payments'}</td></tr>}</tbody>
        </table>
      </div>

      {/* Event attendance */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">{sv ? 'Eventhistorik' : 'Event history'} <span className="text-gray-400 font-normal">({eventsCount})</span></h2>
          {eventsCount > PREVIEW && showAll !== 'events' && <a href={viewAllHref('events')} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'} →</a>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-5 py-2 text-left">{sv ? 'Event' : 'Event'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Kategori' : 'Category'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Eventdatum' : 'Event date'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Registrerad' : 'Registered'}</th>
            <th className="px-5 py-2 text-left">{sv ? 'Incheckning' : 'Check-in'}</th>
          </tr></thead>
          <tbody className="divide-y">{attendedEvents.map((e: any) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{sv ? e.eventTitleSv : e.eventTitleEn}{e.orderId && <a href={`/${locale}/admin/orders/${e.orderId}`} className="ml-2 text-blue-600 text-xs hover:underline">order</a>}</td>
              <td className="px-5 py-3 text-gray-500">{(sv ? e.categorySv : e.categoryEn) || '—'}</td>
              <td className="px-5 py-3 text-gray-500">{e.startsAt ? new Date(e.startsAt).toLocaleDateString('sv-SE') : '—'}</td>
              <td className="px-5 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString('sv-SE')}</td>
              <td className="px-5 py-3">{e.checkedInAt ? <span className="text-green-700 text-xs">✓</span> : <span className="text-gray-300">—</span>}</td>
            </tr>
          ))}{attendedEvents.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">{sv ? 'Ingen historik' : 'No history'}</td></tr>}</tbody>
        </table>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">{sv ? 'Kurser' : 'Courses'} <span className="text-gray-400 font-normal">({enrolledCourses.length})</span></h2>
          {enrolledCourses.length > PREVIEW && showAll !== 'courses' && <a href={viewAllHref('courses')} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'} →</a>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr>
            <th className="px-5 py-2 text-left">{sv ? 'Kurs' : 'Course'}</th>
            <th className="px-5 py-2 text-left">Status</th>
            <th className="px-5 py-2 text-left">{sv ? 'Startdatum' : 'Start date'}</th>
          </tr></thead>
          <tbody className="divide-y">{coursesDisplay.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 font-medium">{sv ? c.titleSv : c.titleEn}{c.orderId && <a href={`/${locale}/admin/orders/${c.orderId}`} className="ml-2 text-blue-600 text-xs hover:underline">order</a>}</td>
              <td className="px-5 py-3">{c.completedAt ? <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">{sv ? 'Klar' : 'Completed'}</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">{sv ? 'Pågår' : 'In progress'}</span>}</td>
              <td className="px-5 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('sv-SE')}</td>
            </tr>
          ))}{coursesDisplay.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400">{sv ? 'Inga kurser' : 'No courses'}</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
