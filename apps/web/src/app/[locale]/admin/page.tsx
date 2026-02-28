import { createDb, users, events, orders, memberships, payments, orderItems } from '@yeshe/db';
import { sql, eq, gte } from 'drizzle-orm';
import Stripe from 'stripe';
import { Pool } from 'pg';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runStripeSync(formData: FormData) {
  'use server';
  await requireAdmin('sv');

  const limit = Math.min(Number(formData.get('limit') || 500), 5000);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

  let inserted = 0;
  let processed = 0;

  const { rows: orderRows } = await pool.query(
    `SELECT id, total_sek, created_at FROM orders WHERE channel = 'online' ORDER BY created_at DESC`
  );
  const byAmount = new Map<number, Array<{ id: string; ts: number }>>();
  for (const o of orderRows) {
    const cents = Math.round(Number(o.total_sek) * 100);
    if (!byAmount.has(cents)) byAmount.set(cents, []);
    byAmount.get(cents)!.push({ id: o.id, ts: new Date(o.created_at).getTime() });
  }

  const { rows: existing } = await pool.query(`SELECT gateway_reference FROM payments WHERE gateway_reference IS NOT NULL`);
  const refs = new Set(existing.map((r) => r.gateway_reference));

  let startingAfter: string | undefined;
  while (processed < limit) {
    const page = await stripe.charges.list({
      limit: Math.min(100, limit - processed),
      starting_after: startingAfter,
    });
    if (!page.data.length) break;

    for (const ch of page.data) {
      processed++;
      if (refs.has(ch.id)) continue;
      if ((ch.currency || '').toLowerCase() !== 'sek') continue;

      let orderId: string | null = null;
      const amountCandidates = byAmount.get(ch.amount) || [];
      if (amountCandidates.length) {
        const ts = (ch.created || 0) * 1000;
        let best: { id: string; d: number } | null = null;
        for (const c of amountCandidates) {
          const d = Math.abs(c.ts - ts);
          if (d <= 2 * 60 * 60 * 1000 && (!best || d < best.d)) best = { id: c.id, d };
        }
        if (best) orderId = best.id;
      }
      if (!orderId) continue;

      const status = ch.status === 'succeeded' ? 'succeeded' : ch.status === 'failed' ? 'failed' : 'pending';
      await pool.query(
        `INSERT INTO payments (order_id, method, status, amount_sek, gateway_reference, gateway_response, created_at)
         VALUES ($1, 'stripe_card', $2::payment_status, $3, $4, $5::jsonb, to_timestamp($6))`,
        [orderId, status, (ch.amount || 0) / 100, ch.id, JSON.stringify({ receipt_url: ch.receipt_url, metadata: ch.metadata }), ch.created || Math.floor(Date.now() / 1000)]
      );
      refs.add(ch.id);
      inserted++;
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  await pool.query(
    `INSERT INTO audit_log (action, channel, method, metadata, description)
     VALUES ('stripe.sync.run', 'online', 'stripe_card', $1::jsonb, $2)`,
    [JSON.stringify({ processed, inserted, limit }), `Stripe sync run: inserted ${inserted} payments`]
  );

  revalidatePath('/sv/admin');
  revalidatePath('/en/admin');
}

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(sql`deleted_at IS NULL`);
  const [memberCount] = await db.select({ count: sql<number>`count(*)::int` }).from(memberships).where(eq(memberships.status, 'active'));
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(gte(events.startsAt, now));
  const [orderCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(gte(orders.createdAt, thirtyDaysAgo));
  const [paymentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(payments);
  const [itemCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orderItems);
  const [linkedOrders] = await db.select({ count: sql<number>`count(*)::int` }).from(orders).where(sql`${orders.userId} IS NOT NULL`);

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
    .select({ id: events.id, titleSv: events.titleSv, titleEn: events.titleEn, startsAt: events.startsAt, venue: events.venue })
    .from(events)
    .where(gte(events.startsAt, now))
    .orderBy(events.startsAt)
    .limit(5);

  const statusMap: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending', confirmed: sv ? 'Betald' : 'Paid', failed: sv ? 'Misslyckad' : 'Failed', refunded: sv ? 'Återbetald' : 'Refunded', cancelled: sv ? 'Avbruten' : 'Cancelled',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{sv ? 'Data från databasen i realtid.' : 'Real-time data from the database.'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-3xl font-bold text-blue-900">{memberCount.count}</p><p className="text-sm text-blue-700">{sv ? 'Aktiva medlemmar' : 'Active members'}</p></div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4"><p className="text-3xl font-bold text-green-900">{eventCount.count}</p><p className="text-sm text-green-700">{sv ? 'Kommande evenemang' : 'Upcoming events'}</p></div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="text-3xl font-bold text-yellow-900">{orderCount.count}</p><p className="text-sm text-yellow-700">{sv ? 'Ordrar (30 dagar)' : 'Orders (30 days)'}</p></div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4"><p className="text-3xl font-bold text-purple-900">{userCount.count}</p><p className="text-sm text-purple-700">{sv ? 'Totalt användare' : 'Total users'}</p></div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">{sv ? 'Commerce datakvalitet' : 'Commerce Data Quality'}</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">{sv ? 'Länkade ordrar' : 'Linked Orders'}</p><p className="text-xl font-semibold">{linkedOrders.count}</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">Payments</p><p className="text-xl font-semibold">{paymentCount.count}</p></div>
          <div className="rounded-lg border bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500 uppercase">Order Items</p><p className="text-xl font-semibold">{itemCount.count}</p></div>
        </div>

        <form action={runStripeSync} className="flex items-center gap-2">
          <input type="number" name="limit" defaultValue={500} min={10} max={5000} className="w-28 border rounded-lg px-3 py-2 text-sm" />
          <button className="px-4 py-2 rounded-lg bg-[#58595b] text-white text-sm font-medium hover:bg-[#444]">{sv ? 'Synka Stripe nu' : 'Sync Stripe now'}</button>
          <span className="text-xs text-gray-500">{sv ? 'Läser charges från Stripe API och lägger in saknade betalningar.' : 'Reads charges from Stripe API and inserts missing payments.'}</span>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Senaste ordrar' : 'Recent Orders'}</h2>
            <a href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          <table className="w-full"><tbody className="divide-y divide-gray-50">
            {recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-500">#{o.orderNumber}</td>
                <td className="px-6 py-3 text-sm text-gray-900">{o.firstName} {o.lastName}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{Math.round(Number(o.totalSek))} kr</td>
                <td className="px-6 py-3 text-sm font-medium">{statusMap[o.status] || o.status}</td>
              </tr>
            ))}
          </tbody></table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h2>
            <a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                <div><p className="text-sm font-medium text-gray-900">{sv ? e.titleSv : e.titleEn}</p><p className="text-xs text-gray-500">{e.venue || ''}</p></div>
                <p className="text-sm text-gray-500">{new Date(e.startsAt).toLocaleDateString('sv-SE')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
