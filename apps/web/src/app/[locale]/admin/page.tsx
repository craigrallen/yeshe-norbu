import { createDb, users, events, orders, memberships } from '@yeshe/db';
import { sql, eq, gte, and } from 'drizzle-orm';

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(sql`deleted_at IS NULL`);
  const [memberCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memberships).where(eq(memberships.status, 'active'));
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(gte(events.startsAt, now));
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(gte(orders.createdAt, thirtyDaysAgo));

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalSek: orders.totalSek,
      status: orders.status,
      createdAt: orders.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(10);

  const upcomingEvents = await db
    .select({
      id: events.id,
      titleSv: events.titleSv,
      titleEn: events.titleEn,
      startsAt: events.startsAt,
      venue: events.venue,
    })
    .from(events)
    .where(gte(events.startsAt, now))
    .orderBy(events.startsAt)
    .limit(5);

  const statusMap: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending',
    confirmed: sv ? 'Betald' : 'Paid',
    failed: sv ? 'Misslyckad' : 'Failed',
    refunded: sv ? 'Återbetald' : 'Refunded',
    cancelled: sv ? 'Avbruten' : 'Cancelled',
  };
  const statusColor: Record<string, string> = {
    pending: 'text-yellow-600',
    confirmed: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-red-600',
    cancelled: 'text-gray-500',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{sv ? 'Data från databasen i realtid.' : 'Real-time data from the database.'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-blue-900">{memberCount.count}</p>
          <p className="text-sm text-blue-700">{sv ? 'Aktiva medlemmar' : 'Active members'}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-green-900">{eventCount.count}</p>
          <p className="text-sm text-green-700">{sv ? 'Kommande evenemang' : 'Upcoming events'}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-yellow-900">{orderCount.count}</p>
          <p className="text-sm text-yellow-700">{sv ? 'Ordrar (30 dagar)' : 'Orders (30 days)'}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-3xl font-bold text-purple-900">{userCount.count}</p>
          <p className="text-sm text-purple-700">{sv ? 'Totalt användare' : 'Total users'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Senaste ordrar' : 'Recent Orders'}</h2>
            <a href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">{sv ? 'Inga ordrar ännu' : 'No orders yet'}</p>
          ) : (
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">#{o.orderNumber}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{o.firstName} {o.lastName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{Math.round(Number(o.totalSek))} kr</td>
                    <td className={"px-6 py-3 text-sm font-medium " + (statusColor[o.status] || 'text-gray-500')}>
                      {statusMap[o.status] || o.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h2>
            <a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">{sv ? 'Inga kommande evenemang' : 'No upcoming events'}</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sv ? e.titleSv : e.titleEn}</p>
                    <p className="text-xs text-gray-500">{e.venue || ''}</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(e.startsAt).toLocaleDateString('sv-SE')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
