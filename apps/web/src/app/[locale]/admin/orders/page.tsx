import { createDb, orders, users, payments } from '@yeshe/db';
import { sql, eq, desc } from 'drizzle-orm';

export default async function AdminOrders({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);

  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalSek: orders.totalSek,
      netSek: orders.netSek,
      status: orders.status,
      channel: orders.channel,
      createdAt: orders.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(200);

  const statusMap: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending',
    confirmed: sv ? 'Betald' : 'Paid',
    failed: sv ? 'Misslyckad' : 'Failed',
    refunded: sv ? 'Återbetald' : 'Refunded',
    partially_refunded: sv ? 'Delvis återbetald' : 'Partially refunded',
    cancelled: sv ? 'Avbruten' : 'Cancelled',
  };
  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-red-100 text-red-800',
    partially_refunded: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Beställningar' : 'Orders'}</h1>
        <p className="text-gray-500 text-sm mt-1">{total.count} {sv ? 'ordrar totalt' : 'total orders'} ({sv ? 'visar senaste 200' : 'showing latest 200'})</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Kund' : 'Customer'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'E-post' : 'Email'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Kanal' : 'Channel'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm"><a href={`/${locale}/admin/orders/${o.id}`} className="text-blue-600 hover:underline">#{o.orderNumber}</a></td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{o.firstName} {o.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{o.email || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{Math.round(Number(o.totalSek))} kr</td>
                <td className="px-6 py-4">
                  <span className={"px-2 py-1 text-xs rounded-full font-medium " + (statusColor[o.status] || 'bg-gray-100 text-gray-800')}>
                    {statusMap[o.status] || o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{o.channel}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString('sv-SE')}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">{sv ? 'Inga ordrar ännu' : 'No orders yet'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
