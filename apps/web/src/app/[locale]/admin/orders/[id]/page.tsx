import { createDb, orders, users, orderItems, payments } from '@yeshe/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

async function updateOrderStatus(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as any;
  const notes = String(formData.get('notes') || '');
  await db.update(orders).set({ status, notes: notes || null, updatedAt: new Date() }).where(eq(orders.id, id));
  revalidatePath('/sv/admin/orders');
  revalidatePath('/en/admin/orders');
}

export default async function OrderDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalSek: orders.totalSek,
      discountSek: orders.discountSek,
      netSek: orders.netSek,
      currency: orders.currency,
      status: orders.status,
      channel: orders.channel,
      ipAddress: orders.ipAddress,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userId: orders.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Order hittades inte' : 'Order not found'}</h1></div>;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const paymentRows = await db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt));

  const statusLabel: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending', confirmed: sv ? 'Betald' : 'Paid',
    failed: sv ? 'Misslyckad' : 'Failed', refunded: sv ? 'Återbetald' : 'Refunded',
    partially_refunded: sv ? 'Delvis återbetald' : 'Partially refunded',
    cancelled: sv ? 'Avbruten' : 'Cancelled',
  };
  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800', refunded: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <a href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla ordrar' : 'All orders'}</a>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Order' : 'Order'} #{order.orderNumber}</h1>
          <p className="text-sm text-gray-400">ID: {order.id}</p>
        </div>
        <span className={"px-3 py-1 text-sm rounded-full font-medium " + (statusColor[order.status] || 'bg-gray-100')}>
          {statusLabel[order.status] || order.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-3">{sv ? 'Kund' : 'Customer'}</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.firstName} {order.lastName}</p>
            <p className="text-gray-500">{order.email || '\u2014'}</p>
            {order.userId && <a href={`/${locale}/admin/users/${order.userId}`} className="text-blue-600 hover:underline text-xs">{sv ? 'Visa användare' : 'View user'} &rarr;</a>}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-3">{sv ? 'Orderdetaljer' : 'Order details'}</h2>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">{sv ? 'Totalt' : 'Total'}:</span> {Math.round(Number(order.totalSek))} {order.currency}</p>
            <p><span className="text-gray-400">{sv ? 'Rabatt' : 'Discount'}:</span> {Math.round(Number(order.discountSek))} {order.currency}</p>
            <p><span className="text-gray-400">{sv ? 'Netto' : 'Net'}:</span> {Math.round(Number(order.netSek))} {order.currency}</p>
            <p><span className="text-gray-400">{sv ? 'Kanal' : 'Channel'}:</span> {order.channel}</p>
            <p><span className="text-gray-400">IP:</span> {order.ipAddress || '\u2014'}</p>
            <p><span className="text-gray-400">{sv ? 'Skapad' : 'Created'}:</span> {new Date(order.createdAt).toLocaleString('sv-SE')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Orderrader' : 'Order items'} ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga orderrader importerade' : 'No order items imported'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Beskrivning' : 'Description'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Antal' : 'Qty'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Styckpris' : 'Unit price'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Totalt' : 'Total'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {items.map(i => (
                <tr key={i.id}>
                  <td className="px-4 py-2 text-sm">{i.description}</td>
                  <td className="px-4 py-2 text-sm">{i.quantity}</td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(i.unitPriceSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(i.totalPriceSek))} kr</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Betalningar' : 'Payments'} ({paymentRows.length})</h2>
        {paymentRows.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga betalningar registrerade' : 'No payments recorded'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Metod' : 'Method'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Referens' : 'Reference'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Datum' : 'Date'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {paymentRows.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm">{p.method}</td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(p.amountSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{p.status}</td>
                  <td className="px-4 py-2 text-sm text-xs text-gray-400">{p.stripePaymentIntentId || p.swishPaymentId || '\u2014'}</td>
                  <td className="px-4 py-2 text-sm">{new Date(p.createdAt).toLocaleString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Uppdatera status' : 'Update status'}</h2>
        <form action={updateOrderStatus} className="space-y-3">
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" defaultValue={order.status} className="border rounded-lg px-3 py-2 w-full md:w-64">
              <option value="pending">{sv ? 'Väntar' : 'Pending'}</option>
              <option value="confirmed">{sv ? 'Betald' : 'Confirmed'}</option>
              <option value="refunded">{sv ? 'Återbetald' : 'Refunded'}</option>
              <option value="cancelled">{sv ? 'Avbruten' : 'Cancelled'}</option>
              <option value="failed">{sv ? 'Misslyckad' : 'Failed'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Anteckningar' : 'Notes'}</label>
            <textarea name="notes" rows={3} defaultValue={order.notes || ''} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <button type="submit" className="px-6 py-2 bg-[#58595b] text-white rounded-lg hover:bg-[#6b6c6e] font-medium">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
