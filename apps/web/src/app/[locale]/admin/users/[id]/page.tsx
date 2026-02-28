import { createDb, users, userRoles, memberships, membershipPlans, orders, payments } from '@yeshe/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

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

export default async function UserDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

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

  const userOrders = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, totalSek: orders.totalSek, status: orders.status, channel: orders.channel, createdAt: orders.createdAt })
    .from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)).limit(100);

  const userPayments = await db
    .select({ id: payments.id, orderId: payments.orderId, method: payments.method, status: payments.status, amountSek: payments.amountSek, gatewayReference: payments.gatewayReference, createdAt: payments.createdAt, orderNumber: orders.orderNumber })
    .from(payments).leftJoin(orders, eq(payments.orderId, orders.id)).where(eq(orders.userId, id)).orderBy(desc(payments.createdAt)).limit(100);

  const [stats] = await db.select({ totalOrders: sql<number>`count(*)::int`, totalSpend: sql<string>`coalesce(sum(${orders.totalSek}), 0)::text`, avgOrder: sql<string>`coalesce(avg(${orders.totalSek}), 0)::text` }).from(orders).where(eq(orders.userId, id));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <a href={`/${locale}/admin/users`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla användare' : 'All users'}</a>

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

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Totala ordrar' : 'Total Orders'}</p><p className="text-xl font-semibold">{stats?.totalOrders || 0}</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Total omsättning' : 'Lifetime Spend'}</p><p className="text-xl font-semibold">{Math.round(Number(stats?.totalSpend || 0))} kr</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Snittorder' : 'Avg Order'}</p><p className="text-xl font-semibold">{Math.round(Number(stats?.avgOrder || 0))} kr</p></div>
        </div>

        <button className="px-5 py-2 rounded-lg bg-[#58595b] text-white">{sv ? 'Spara användare' : 'Save user'}</button>
      </form>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Ordrar' : 'Orders'} ({userOrders.length})</h2>
        <div className="space-y-1 text-sm">{userOrders.map(o => <a key={o.id} href={`/${locale}/admin/orders/${o.id}`} className="block text-blue-600 hover:underline">#{o.orderNumber} · {Math.round(Number(o.totalSek))} kr · {o.status}</a>)}</div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Medlemskap' : 'Memberships'} ({mems.length})</h2>
        <div className="space-y-1 text-sm">{mems.map(m => <div key={m.id}>{sv ? m.planName : m.planNameEn} · {m.status}</div>)}{mems.length===0&&<div className="text-gray-500">{sv?'Inga medlemskap':'No memberships'}</div>}</div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Betalningar' : 'Payments'} ({userPayments.length})</h2>
        <div className="space-y-1 text-sm">{userPayments.map(p => <a key={p.id} href={`/${locale}/admin/orders/${p.orderId}`} className="block text-blue-600 hover:underline">#{p.orderNumber} · {Math.round(Number(p.amountSek))} kr · {p.method} · {p.status}</a>)}</div>
      </div>
    </div>
  );
}
