import { createDb, users, userRoles, memberships, membershipPlans, orders, payments } from '@yeshe/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/authz';

export default async function UserDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Användare hittades inte' : 'User not found'}</h1></div>;

  const roles = await db.select().from(userRoles).where(eq(userRoles.userId, id));

  const mems = await db
    .select({
      id: memberships.id,
      status: memberships.status,
      periodStart: memberships.currentPeriodStart,
      periodEnd: memberships.currentPeriodEnd,
      planName: membershipPlans.nameSv,
      planNameEn: membershipPlans.nameEn,
    })
    .from(memberships)
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .where(eq(memberships.userId, id))
    .orderBy(desc(memberships.createdAt));

  const userOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalSek: orders.totalSek,
      status: orders.status,
      channel: orders.channel,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, id))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const userPayments = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      method: payments.method,
      status: payments.status,
      amountSek: payments.amountSek,
      gatewayReference: payments.gatewayReference,
      createdAt: payments.createdAt,
      orderNumber: orders.orderNumber,
    })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(orders.userId, id))
    .orderBy(desc(payments.createdAt))
    .limit(100);

  const [stats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalSpend: sql<string>`coalesce(sum(${orders.totalSek}), 0)::text`,
      avgOrder: sql<string>`coalesce(avg(${orders.totalSek}), 0)::text`,
    })
    .from(orders)
    .where(eq(orders.userId, id));

  const statusLabel: Record<string, string> = {
    active: sv ? 'Aktiv' : 'Active', expired: sv ? 'Utgången' : 'Expired',
    cancelled: sv ? 'Avbruten' : 'Cancelled', paused: sv ? 'Pausad' : 'Paused',
  };
  const orderStatus: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending', confirmed: sv ? 'Betald' : 'Paid',
    failed: sv ? 'Misslyckad' : 'Failed', refunded: sv ? 'Återbetald' : 'Refunded',
    cancelled: sv ? 'Avbruten' : 'Cancelled',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <a href={`/${locale}/admin/users`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla användare' : 'All users'}</a>
      <div className="bg-white rounded-xl border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.firstName} {user.lastName}</h1>
        <p className="text-gray-500">{user.email}</p>
        <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
          <div><span className="text-gray-400">{sv ? 'Telefon' : 'Phone'}:</span> {user.phone || '—'}</div>
          <div><span className="text-gray-400">{sv ? 'Språk' : 'Locale'}:</span> {user.locale}</div>
          <div><span className="text-gray-400">{sv ? 'Registrerad' : 'Joined'}:</span> {new Date(user.createdAt).toLocaleDateString('sv-SE')}</div>
          <div><span className="text-gray-400">Stripe ID:</span> {user.stripeCustomerId || '—'}</div>
          <div><span className="text-gray-400">{sv ? 'E-post verifierad' : 'Email verified'}:</span> {user.emailVerified ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-400">{sv ? 'Marknadsföring' : 'Marketing'}:</span> {user.consentMarketing ? 'Yes' : 'No'}</div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-5">
          <div className="rounded-lg border bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">{sv ? 'Totala ordrar' : 'Total Orders'}</p>
            <p className="text-xl font-semibold text-gray-900">{stats?.totalOrders || 0}</p>
          </div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">{sv ? 'Total omsättning' : 'Lifetime Spend'}</p>
            <p className="text-xl font-semibold text-gray-900">{Math.round(Number(stats?.totalSpend || 0))} kr</p>
          </div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">{sv ? 'Snittorder' : 'Avg Order'}</p>
            <p className="text-xl font-semibold text-gray-900">{Math.round(Number(stats?.avgOrder || 0))} kr</p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {roles.map(r => (
            <span key={r.id} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{r.role}</span>
          ))}
          {roles.length === 0 && <span className="text-xs text-gray-400">{sv ? 'Inga roller' : 'No roles'}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-2">ID: {user.id}</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Medlemskap' : 'Memberships'} ({mems.length})</h2>
        {mems.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga medlemskap' : 'No memberships'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Plan' : 'Plan'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Period' : 'Period'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {mems.map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-sm">{sv ? m.planName : m.planNameEn}</td>
                  <td className="px-4 py-2 text-sm">{statusLabel[m.status] || m.status}</td>
                  <td className="px-4 py-2 text-sm">{new Date(m.periodStart).toLocaleDateString('sv-SE')} — {new Date(m.periodEnd).toLocaleDateString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Ordrar' : 'Orders'} ({userOrders.length})</h2>
        {userOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga ordrar' : 'No orders'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Kanal' : 'Channel'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Datum' : 'Date'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {userOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm"><a href={`/${locale}/admin/orders/${o.id}`} className="text-blue-600 hover:underline">#{o.orderNumber}</a></td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(o.totalSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{orderStatus[o.status] || o.status}</td>
                  <td className="px-4 py-2 text-sm">{o.channel}</td>
                  <td className="px-4 py-2 text-sm">{new Date(o.createdAt).toLocaleDateString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-lg mb-3">{sv ? 'Betalningar' : 'Payments'} ({userPayments.length})</h2>
        {userPayments.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga betalningar' : 'No payments'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Order' : 'Order'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Metod' : 'Method'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ref</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Datum' : 'Date'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {userPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm"><a href={`/${locale}/admin/orders/${p.orderId}`} className="text-blue-600 hover:underline">#{p.orderNumber}</a></td>
                  <td className="px-4 py-2 text-sm">{p.method}</td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(p.amountSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{p.status}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{p.gatewayReference || '—'}</td>
                  <td className="px-4 py-2 text-sm">{new Date(p.createdAt).toLocaleDateString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
