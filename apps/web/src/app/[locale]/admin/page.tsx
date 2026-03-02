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
  const { rows: orderRows } = await pool.query(`SELECT id, total_sek, created_at FROM orders WHERE channel = 'online' ORDER BY created_at DESC`);
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
    const page = await stripe.charges.list({ limit: Math.min(100, limit - processed), starting_after: startingAfter });
    if (!page.data.length) break;
    for (const ch of page.data) {
      processed++;
      if (refs.has(ch.id) || (ch.currency || '').toLowerCase() !== 'sek') continue;
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
      await pool.query(`INSERT INTO payments (order_id, method, status, amount_sek, gateway_reference, gateway_response, created_at)
         VALUES ($1, 'stripe_card', $2::payment_status, $3, $4, $5::jsonb, to_timestamp($6))`,
        [orderId, status, (ch.amount || 0) / 100, ch.id, JSON.stringify({ receipt_url: ch.receipt_url, metadata: ch.metadata }), ch.created || Math.floor(Date.now() / 1000)]);
      refs.add(ch.id);
      inserted++;
    }
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  await pool.query(`INSERT INTO audit_log (action, channel, method, metadata, description)
     VALUES ('stripe.sync.run', 'online', 'stripe_card', $1::jsonb, $2)`,
    [JSON.stringify({ processed, inserted, limit }), `Stripe sync run: inserted ${inserted} payments`]);
  revalidatePath('/sv/admin');
  revalidatePath('/en/admin');
}

export default async function AdminDashboard({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { q?: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  const q = (searchParams.q || '').trim();

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
    .select({ id: orders.id, orderNumber: orders.orderNumber, totalSek: orders.totalSek, status: orders.status, createdAt: orders.createdAt, firstName: users.firstName, lastName: users.lastName })
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

  let search: any = null;
  if (q) {
    const like = `%${q}%`;
    const [usersR, ordersR, eventsR, productsR] = await Promise.all([
      pool.query(`SELECT id, first_name, last_name, email FROM users WHERE deleted_at IS NULL AND (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1) ORDER BY created_at DESC LIMIT 10`, [like]),
      pool.query(`SELECT id, order_number, total_sek, created_at FROM orders WHERE order_number::text ILIKE $1 OR id::text ILIKE $1 ORDER BY created_at DESC LIMIT 10`, [like]),
      pool.query(`SELECT id, slug, title_sv, title_en, starts_at FROM events WHERE title_sv ILIKE $1 OR title_en ILIKE $1 OR slug ILIKE $1 ORDER BY starts_at DESC LIMIT 10`, [like]),
      pool.query(`SELECT id, slug, name_sv, name_en, price_sek FROM products WHERE name_sv ILIKE $1 OR name_en ILIKE $1 OR slug ILIKE $1 ORDER BY updated_at DESC LIMIT 10`, [like]),
    ]);
    search = { users: usersR.rows, orders: ordersR.rows, events: eventsR.rows, products: productsR.rows };
  }

  const statusMap: Record<string, string> = {
    pending: sv ? 'Väntar' : 'Pending', confirmed: sv ? 'Betald' : 'Paid', failed: sv ? 'Misslyckad' : 'Failed', refunded: sv ? 'Återbetald' : 'Refunded', cancelled: sv ? 'Avbruten' : 'Cancelled',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{sv ? 'Data från databasen i realtid.' : 'Real-time data from the database.'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
        <form className="flex items-center gap-2 flex-wrap">
          <input name="q" defaultValue={q} placeholder={sv ? 'Global sök: användare, order, event, produkt...' : 'Global search: user, order, event, product...'} className="w-[420px] max-w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" />
          <button className="px-4 py-2 rounded-lg bg-[#58595b] text-white text-sm">{sv ? 'Sök' : 'Search'}</button>
          {q && <a href={`/${locale}/admin`} className="text-sm text-gray-500 hover:underline">{sv ? 'Rensa' : 'Clear'}</a>}
        </form>
      </div>

      {q && search && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"><h3 className="font-semibold dark:text-white mb-2">{sv ? 'Användare' : 'Users'} ({search.users.length})</h3>{search.users.map((u:any)=><a key={u.id} href={`/${locale}/admin/users/${u.id}`} className="block text-sm text-blue-600 hover:underline py-0.5">{u.first_name} {u.last_name} · {u.email}</a>)}{search.users.length===0&&<p className="text-sm text-gray-400">{sv?'Inga träffar':'No matches'}</p>}</div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"><h3 className="font-semibold dark:text-white mb-2">{sv ? 'Ordrar' : 'Orders'} ({search.orders.length})</h3>{search.orders.map((o:any)=><a key={o.id} href={`/${locale}/admin/orders/${o.id}`} className="block text-sm text-blue-600 hover:underline py-0.5">#{o.order_number} · {Math.round(Number(o.total_sek))} kr</a>)}{search.orders.length===0&&<p className="text-sm text-gray-400">{sv?'Inga träffar':'No matches'}</p>}</div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"><h3 className="font-semibold dark:text-white mb-2">{sv ? 'Evenemang' : 'Events'} ({search.events.length})</h3>{search.events.map((e:any)=><a key={e.id} href={`/${locale}/admin/events/${e.id}`} className="block text-sm text-blue-600 hover:underline py-0.5">{sv?e.title_sv:e.title_en}</a>)}{search.events.length===0&&<p className="text-sm text-gray-400">{sv?'Inga träffar':'No matches'}</p>}</div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4"><h3 className="font-semibold dark:text-white mb-2">{sv ? 'Produkter' : 'Products'} ({search.products.length})</h3>{search.products.map((p:any)=><a key={p.id} href={`/${locale}/admin/products?q=${encodeURIComponent(p.slug)}`} className="block text-sm text-blue-600 hover:underline py-0.5">{sv?p.name_sv:p.name_en} · {Math.round(Number(p.price_sek))} kr</a>)}{search.products.length===0&&<p className="text-sm text-gray-400">{sv?'Inga träffar':'No matches'}</p>}</div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4"><p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{memberCount.count}</p><p className="text-sm text-blue-700 dark:text-blue-300">{sv ? 'Aktiva medlemmar' : 'Active members'}</p></div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4"><p className="text-3xl font-bold text-green-900 dark:text-green-100">{eventCount.count}</p><p className="text-sm text-green-700 dark:text-green-300">{sv ? 'Kommande evenemang' : 'Upcoming events'}</p></div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"><p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{orderCount.count}</p><p className="text-sm text-yellow-700 dark:text-yellow-300">{sv ? 'Ordrar (30 dagar)' : 'Orders (30 days)'}</p></div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4"><p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{userCount.count}</p><p className="text-sm text-purple-700 dark:text-purple-300">{sv ? 'Totalt användare' : 'Total users'}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">{sv ? 'Commerce datakvalitet' : 'Commerce Data Quality'}</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Länkade ordrar' : 'Linked Orders'}</p><p className="text-xl font-semibold dark:text-gray-100">{linkedOrders.count}</p></div>
          <div className="rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Payments</p><p className="text-xl font-semibold dark:text-gray-100">{paymentCount.count}</p></div>
          <div className="rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Order Items</p><p className="text-xl font-semibold dark:text-gray-100">{itemCount.count}</p></div>
        </div>
        <form action={runStripeSync} className="flex items-center gap-2">
          <input type="number" name="limit" defaultValue={500} min={10} max={5000} className="w-28 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100" />
          <button className="px-4 py-2 rounded-lg bg-[#58595b] text-white text-sm font-medium hover:bg-[#444]">{sv ? 'Synka Stripe nu' : 'Sync Stripe now'}</button>
          <span className="text-xs text-gray-500 dark:text-gray-400">{sv ? 'Läser charges från Stripe API och lägger in saknade betalningar.' : 'Reads charges from Stripe API and inserts missing payments.'}</span>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"><h2 className="font-semibold text-gray-900 dark:text-white">{sv ? 'Senaste ordrar' : 'Recent Orders'}</h2><a href={`/${locale}/admin/orders`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a></div>
          <table className="w-full"><tbody className="divide-y divide-gray-50 dark:divide-gray-700">{recentOrders.map((o) => (<tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700"><td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">#{o.orderNumber}</td><td className="px-6 py-3 text-sm text-gray-900 dark:text-gray-100">{o.firstName} {o.lastName}</td><td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{Math.round(Number(o.totalSek))} kr</td><td className="px-6 py-3 text-sm font-medium dark:text-gray-200">{statusMap[o.status] || o.status}</td></tr>))}</tbody></table>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"><h2 className="font-semibold text-gray-900 dark:text-white">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h2><a href={`/${locale}/admin/events`} className="text-sm text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a></div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">{upcomingEvents.map((e) => (<div key={e.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700"><div><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sv ? e.titleSv : e.titleEn}</p><p className="text-xs text-gray-500 dark:text-gray-400">{e.venue || ''}</p></div><p className="text-sm text-gray-500 dark:text-gray-400">{new Date(e.startsAt).toLocaleDateString('sv-SE')}</p></div>))}</div>
        </div>
      </div>
    </div>
  );
}
