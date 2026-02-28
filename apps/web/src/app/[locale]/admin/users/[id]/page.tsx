import { createHash } from 'crypto';
import {
  createDb,
  users,
  userRoles,
  memberships,
  membershipPlans,
  orders,
  payments,
  courseEnrollments,
  courses,
  eventRegistrations,
  events,
  eventCategories,
} from '@yeshe/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

const PAGE_SIZE = 12;

async function saveUser(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const locale = String(formData.get('locale') || 'sv');
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const userLocale = String(formData.get('userLocale') || 'sv').trim();
  const consentMarketing = formData.get('consentMarketing') === 'on';
  const emailVerified = formData.get('emailVerified') === 'on';
  const isAdmin = formData.get('isAdmin') === 'on';

  await db.update(users).set({
    firstName: firstName || null,
    lastName: lastName || null,
    email,
    phone: phone || null,
    locale: userLocale,
    consentMarketing,
    emailVerified,
    updatedAt: new Date(),
  }).where(eq(users.id, id));

  const existing = await db.select().from(userRoles).where(eq(userRoles.userId, id));
  const hasAdmin = existing.some(r => r.role === 'admin');
  if (isAdmin && !hasAdmin) {
    await db.insert(userRoles).values({ userId: id, role: 'admin' as any });
  }
  if (!isAdmin && hasAdmin) {
    await db.delete(userRoles).where(sql`${userRoles.userId} = ${id} AND ${userRoles.role} = 'admin'`);
  }

  revalidatePath(`/${locale}/admin/users`);
  revalidatePath(`/${locale}/admin/users/${id}`);
  revalidatePath(`/${locale}/admin/orders`);
}

function buildPageHref(locale: string, id: string, patch: Record<string, number | string>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(patch)) p.set(k, String(v));
  return `/${locale}/admin/users/${id}?${p.toString()}`;
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
      configured: true as const,
      found: true as const,
      status: member.status,
      emailType: member.email_type,
      memberRating: member.member_rating,
      language: member.language,
      vip: member.vip,
      lastChanged: member.last_changed,
      timestampSignup: member.timestamp_signup,
      timestampOpt: member.timestamp_opt,
      tags: (tagsJson.tags || []).filter((t: any) => t.status === 'active').map((t: any) => t.name),
      stats: member.stats || null,
    };
  } catch {
    return { configured: true as const, found: false as const, error: true as const };
  }
}

export default async function UserDetailPage({
  params: { locale, id },
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const ordersPage = Math.max(1, Number(searchParams?.ordersPage || 1));
  const paymentsPage = Math.max(1, Number(searchParams?.paymentsPage || 1));
  const eventsPage = Math.max(1, Number(searchParams?.eventsPage || 1));

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Användare hittades inte' : 'User not found'}</h1></div>;

  const roles = await db.select().from(userRoles).where(eq(userRoles.userId, id));
  const isAdmin = roles.some(r => r.role === 'admin');

  const mems = await db
    .select({ id: memberships.id, status: memberships.status, periodStart: memberships.currentPeriodStart, periodEnd: memberships.currentPeriodEnd, planName: membershipPlans.nameSv, planNameEn: membershipPlans.nameEn })
    .from(memberships)
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .where(eq(memberships.userId, id))
    .orderBy(desc(memberships.createdAt));
  const isMember = mems.some(m => m.status === 'active');

  const [ordersCountRow] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.userId, id));
  const ordersCount = ordersCountRow?.count || 0;
  const userOrders = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, totalSek: orders.totalSek, status: orders.status, channel: orders.channel, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.userId, id))
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset((ordersPage - 1) * PAGE_SIZE);

  const [paymentsCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(orders.userId, id));
  const paymentsCount = paymentsCountRow?.count || 0;
  const userPayments = await db
    .select({ id: payments.id, orderId: payments.orderId, method: payments.method, status: payments.status, amountSek: payments.amountSek, gatewayReference: payments.gatewayReference, createdAt: payments.createdAt, orderNumber: orders.orderNumber })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(orders.userId, id))
    .orderBy(desc(payments.createdAt))
    .limit(PAGE_SIZE)
    .offset((paymentsPage - 1) * PAGE_SIZE);

  const [eventsCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.userId, id));
  const eventsCount = eventsCountRow?.count || 0;
  const attendedEvents = await db
    .select({
      id: eventRegistrations.id,
      attendeeName: eventRegistrations.attendeeName,
      attendeeEmail: eventRegistrations.attendeeEmail,
      checkedInAt: eventRegistrations.checkedInAt,
      createdAt: eventRegistrations.createdAt,
      eventSlug: events.slug,
      eventTitleSv: events.titleSv,
      eventTitleEn: events.titleEn,
      categorySv: eventCategories.nameSv,
      categoryEn: eventCategories.nameEn,
      startsAt: events.startsAt,
      orderId: eventRegistrations.orderId,
    })
    .from(eventRegistrations)
    .leftJoin(events, eq(eventRegistrations.eventId, events.id))
    .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
    .where(eq(eventRegistrations.userId, id))
    .orderBy(desc(eventRegistrations.createdAt))
    .limit(PAGE_SIZE)
    .offset((eventsPage - 1) * PAGE_SIZE);

  const enrolledCourses = await db
    .select({ id: courseEnrollments.id, orderId: courseEnrollments.orderId, completedAt: courseEnrollments.completedAt, createdAt: courseEnrollments.createdAt, titleSv: courses.titleSv, titleEn: courses.titleEn })
    .from(courseEnrollments)
    .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, id))
    .orderBy(desc(courseEnrollments.createdAt));

  const [stats] = await db.select({ totalOrders: sql<number>`count(*)::int`, totalSpend: sql<string>`coalesce(sum(${orders.totalSek}), 0)::text`, avgOrder: sql<string>`coalesce(avg(${orders.totalSek}), 0)::text` }).from(orders).where(eq(orders.userId, id));

  const lastOrderAt = userOrders[0]?.createdAt || null;
  const lastCourseAt = enrolledCourses[0]?.createdAt || null;
  const lastEventAt = attendedEvents[0]?.createdAt || null;
  const lastActivity = [lastOrderAt, lastCourseAt, lastEventAt].filter(Boolean).sort((a: any, b: any) => +new Date(b) - +new Date(a))[0];
  const inactiveDays = lastActivity ? Math.floor((Date.now() - +new Date(lastActivity)) / (1000 * 60 * 60 * 24)) : null;

  const topCategoryMap = new Map<string, number>();
  attendedEvents.forEach((e: any) => {
    const key = (sv ? e.categorySv : e.categoryEn) || (sv ? 'Okategoriserat' : 'Uncategorized');
    topCategoryMap.set(key, (topCategoryMap.get(key) || 0) + 1);
  });
  const topCategories = Array.from(topCategoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const mailchimp = await getMailchimpData(user.email);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <a href={`/${locale}/admin/users`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla kunder' : 'All customers'}</a>

      <form action={saveUser} className="bg-white rounded-xl border p-6 space-y-4">
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="locale" value={locale} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-500 text-sm">ID: {user.id}</p>
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
          <div><label className="block text-gray-500 mb-1">Stripe ID</label><div className="text-sm py-2">{user.stripeCustomerId || '—'}</div></div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="emailVerified" defaultChecked={Boolean(user.emailVerified)} /> {sv ? 'E-post verifierad' : 'Email verified'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="consentMarketing" defaultChecked={Boolean(user.consentMarketing)} /> {sv ? 'Marknadsföring samtycke' : 'Marketing consent'}</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isAdmin" defaultChecked={isAdmin} /> Admin</label>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Totala ordrar' : 'Total Orders'}</p><p className="text-xl font-semibold">{stats?.totalOrders || 0}</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Total omsättning' : 'Lifetime Spend'}</p><p className="text-xl font-semibold">{Math.round(Number(stats?.totalSpend || 0))} kr</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Snittorder' : 'Avg Order'}</p><p className="text-xl font-semibold">{Math.round(Number(stats?.avgOrder || 0))} kr</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Inaktiv' : 'Inactive'}</p><p className="text-xl font-semibold">{inactiveDays === null ? '—' : `${inactiveDays} ${sv ? 'dagar' : 'days'}`}</p></div>
        </div>

        <button className="px-5 py-2 rounded-lg bg-[#58595b] text-white">{sv ? 'Spara kund' : 'Save customer'}</button>
      </form>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'B2C-marknadshistorik' : 'B2C engagement history'}</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{sv ? 'Senaste aktivitet' : 'Last activity'}</p>
            <p className="font-medium">{lastActivity ? new Date(lastActivity).toLocaleString('sv-SE') : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">{sv ? 'Senaste bokning' : 'Last booking'}</p>
            <p className="font-medium">{lastOrderAt ? new Date(lastOrderAt).toLocaleDateString('sv-SE') : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">{sv ? 'Senaste eventregistrering' : 'Last event registration'}</p>
            <p className="font-medium">{lastEventAt ? new Date(lastEventAt).toLocaleDateString('sv-SE') : '—'}</p>
          </div>
        </div>
        <div className="mt-4 text-sm">
          <p className="text-gray-500 mb-1">{sv ? 'Intressekategorier (från eventhistorik)' : 'Interest categories (from event history)'}</p>
          <div className="flex flex-wrap gap-2">
            {topCategories.length ? topCategories.map(([k, n]) => <span key={k} className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">{k} · {n}</span>) : <span className="text-gray-500">{sv ? 'Ingen historik ännu' : 'No history yet'}</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">Mailchimp</h2>
        {!mailchimp.configured && <p className="text-sm text-gray-500">{sv ? 'Mailchimp API ej konfigurerad (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID).' : 'Mailchimp API not configured (MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID).'}</p>}
        {mailchimp.configured && !mailchimp.found && <p className="text-sm text-gray-500">{sv ? 'Medlem hittades inte i audience ännu.' : 'Member not found in audience yet.'}</p>}
        {mailchimp.configured && mailchimp.found && (
          <div className="space-y-2 text-sm">
            <div className="flex gap-4 flex-wrap">
              <span><span className="text-gray-500">Status:</span> {mailchimp.status}</span>
              <span><span className="text-gray-500">Rating:</span> {mailchimp.memberRating}</span>
              <span><span className="text-gray-500">Language:</span> {mailchimp.language || '—'}</span>
              <span><span className="text-gray-500">VIP:</span> {mailchimp.vip ? 'yes' : 'no'}</span>
            </div>
            <div><span className="text-gray-500">{sv ? 'Senast ändrad:' : 'Last changed:'}</span> {mailchimp.lastChanged ? new Date(mailchimp.lastChanged).toLocaleString('sv-SE') : '—'}</div>
            <div className="flex flex-wrap gap-2">{(mailchimp.tags || []).length ? mailchimp.tags.map((t: string) => <span key={t} className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">{t}</span>) : <span className="text-gray-500">{sv ? 'Inga aktiva tags' : 'No active tags'}</span>}</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Ordrar' : 'Orders'} ({ordersCount})</h2>
        <div className="space-y-1 text-sm">{userOrders.map(o => <a key={o.id} href={`/${locale}/admin/orders/${o.id}`} className="block text-blue-600 hover:underline">#{o.orderNumber} · {Math.round(Number(o.totalSek))} kr · {o.status}</a>)}</div>
        <div className="mt-3 flex gap-3 text-sm">
          {ordersPage > 1 && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage: ordersPage - 1, paymentsPage, eventsPage })}>← {sv ? 'Föregående' : 'Previous'}</a>}
          {ordersPage * PAGE_SIZE < ordersCount && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage: ordersPage + 1, paymentsPage, eventsPage })}>{sv ? 'Nästa' : 'Next'} →</a>}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Medlemskap' : 'Memberships'} ({mems.length})</h2>
        <div className="space-y-1 text-sm">{mems.map(m => <div key={m.id}>{sv ? m.planName : m.planNameEn} · {m.status} · {new Date(m.periodStart).toLocaleDateString('sv-SE')}–{new Date(m.periodEnd).toLocaleDateString('sv-SE')}</div>)}{mems.length===0&&<div className="text-gray-500">{sv?'Inga medlemskap':'No memberships'}</div>}</div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Betalningar' : 'Payments'} ({paymentsCount})</h2>
        <div className="space-y-1 text-sm">{userPayments.map(p => <a key={p.id} href={`/${locale}/admin/orders/${p.orderId}`} className="block text-blue-600 hover:underline">#{p.orderNumber} · {Math.round(Number(p.amountSek))} kr · {p.method} · {p.status}</a>)}</div>
        <div className="mt-3 flex gap-3 text-sm">
          {paymentsPage > 1 && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage, paymentsPage: paymentsPage - 1, eventsPage })}>← {sv ? 'Föregående' : 'Previous'}</a>}
          {paymentsPage * PAGE_SIZE < paymentsCount && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage, paymentsPage: paymentsPage + 1, eventsPage })}>{sv ? 'Nästa' : 'Next'} →</a>}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Eventhistorik' : 'Event attendance history'} ({eventsCount})</h2>
        <div className="space-y-2 text-sm">
          {attendedEvents.map((e: any) => (
            <div key={e.id} className="border-b pb-2 last:border-0">
              <div className="font-medium">{sv ? e.eventTitleSv : e.eventTitleEn}</div>
              <div className="text-gray-500">{(sv ? e.categorySv : e.categoryEn) || (sv ? 'Okategoriserat' : 'Uncategorized')} · {e.startsAt ? new Date(e.startsAt).toLocaleDateString('sv-SE') : '—'}</div>
              <div className="text-gray-500">{sv ? 'Registrerad:' : 'Registered:'} {new Date(e.createdAt).toLocaleDateString('sv-SE')} {e.checkedInAt ? `· ${sv ? 'Incheckad' : 'Checked in'}` : ''}</div>
              {e.orderId && <a href={`/${locale}/admin/orders/${e.orderId}`} className="text-blue-600 hover:underline">{sv ? 'Öppna order' : 'Open order'}</a>}
            </div>
          ))}
          {attendedEvents.length === 0 && <div className="text-gray-500">{sv ? 'Ingen eventhistorik' : 'No event history'}</div>}
        </div>
        <div className="mt-3 flex gap-3 text-sm">
          {eventsPage > 1 && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage, paymentsPage, eventsPage: eventsPage - 1 })}>← {sv ? 'Föregående' : 'Previous'}</a>}
          {eventsPage * PAGE_SIZE < eventsCount && <a className="text-blue-600 hover:underline" href={buildPageHref(locale, id, { ordersPage, paymentsPage, eventsPage: eventsPage + 1 })}>{sv ? 'Nästa' : 'Next'} →</a>}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Kurser' : 'Courses attended'} ({enrolledCourses.length})</h2>
        {enrolledCourses.length === 0 ? <p className="text-sm text-gray-500">{sv ? 'Inga kursregistreringar' : 'No course enrollments'}</p> : (
          <div className="space-y-1 text-sm">{enrolledCourses.map(c => <div key={c.id}><span className="font-medium">{sv ? c.titleSv : c.titleEn}</span> · {c.completedAt ? (sv ? 'Klar' : 'Completed') : (sv ? 'Pågår' : 'In progress')} · {new Date(c.createdAt).toLocaleDateString('sv-SE')}</div>)}</div>
        )}
      </div>
    </div>
  );
}
