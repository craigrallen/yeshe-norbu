import { createDb, memberships, users, membershipPlans, orders } from '@yeshe/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

async function updateMembership(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as any;
  const periodEnd = String(formData.get('periodEnd') || '');
  const planId = String(formData.get('planId') || '');

  const updates: any = { status };
  if (periodEnd) updates.currentPeriodEnd = new Date(periodEnd);
  if (planId) updates.planId = planId;

  await db.update(memberships).set(updates).where(eq(memberships.id, id));
  revalidatePath('/sv/admin/members');
  revalidatePath('/en/admin/members');
}

export default async function MemberDetailPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);
  const db = createDb(process.env.DATABASE_URL!);

  const [mem] = await db
    .select({
      id: memberships.id,
      status: memberships.status,
      periodStart: memberships.currentPeriodStart,
      periodEnd: memberships.currentPeriodEnd,
      createdAt: memberships.createdAt,
      userId: memberships.userId,
      planId: memberships.planId,
      stripeSubId: memberships.stripeSubscriptionId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      planNameSv: membershipPlans.nameSv,
      planNameEn: membershipPlans.nameEn,
      planPrice: membershipPlans.priceSek,
    })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .where(eq(memberships.id, id))
    .limit(1);

  if (!mem) return <div className="p-6"><h1 className="text-xl font-bold text-red-600">{sv ? 'Medlemskap hittades inte' : 'Membership not found'}</h1></div>;

  const plans = await db.select().from(membershipPlans).orderBy(membershipPlans.priceSek);

  const userOrders = mem.userId ? await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, totalSek: orders.totalSek, status: orders.status, createdAt: orders.createdAt })
    .from(orders).where(eq(orders.userId, mem.userId)).orderBy(desc(orders.createdAt)).limit(20) : [];

  const statusLabel: Record<string, string> = {
    active: sv ? 'Aktiv' : 'Active', expired: sv ? 'Utgången' : 'Expired',
    cancelled: sv ? 'Avbruten' : 'Cancelled', paused: sv ? 'Pausad' : 'Paused',
  };
  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800', expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800', paused: 'bg-yellow-100 text-yellow-800',
  };

  function toLocalInput(d: Date | null | undefined) {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 10);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <a href={`/${locale}/admin/members`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Alla medlemmar' : 'All members'}</a>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{mem.firstName} {mem.lastName}</h1>
          <p className="text-gray-500">{mem.email}</p>
          {mem.userId && <a href={`/${locale}/admin/users/${mem.userId}`} className="text-blue-600 hover:underline text-xs">{sv ? 'Visa användarprofil' : 'View user profile'} &rarr;</a>}
        </div>
        <span className={"px-3 py-1 text-sm rounded-full font-medium " + (statusColor[mem.status] || 'bg-gray-100')}>
          {statusLabel[mem.status] || mem.status}
        </span>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Medlemskapsdetaljer' : 'Membership details'}</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400">{sv ? 'Plan' : 'Plan'}:</span> {sv ? mem.planNameSv : mem.planNameEn} ({Math.round(Number(mem.planPrice || 0))} kr)</div>
          <div><span className="text-gray-400">Stripe ID:</span> {mem.stripeSubId || '\u2014'}</div>
          <div><span className="text-gray-400">{sv ? 'Startdatum' : 'Start date'}:</span> {new Date(mem.periodStart).toLocaleDateString('sv-SE')}</div>
          <div><span className="text-gray-400">{sv ? 'Slutdatum' : 'End date'}:</span> {new Date(mem.periodEnd).toLocaleDateString('sv-SE')}</div>
          <div><span className="text-gray-400">{sv ? 'Skapat' : 'Created'}:</span> {new Date(mem.createdAt).toLocaleDateString('sv-SE')}</div>
        </div>
        <p className="text-xs text-gray-400 mt-2">ID: {mem.id}</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Uppdatera medlemskap' : 'Update membership'}</h2>
        <form action={updateMembership} className="space-y-3">
          <input type="hidden" name="id" value={mem.id} />
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={mem.status} className="border rounded-lg px-3 py-2 w-full">
                <option value="active">{sv ? 'Aktiv' : 'Active'}</option>
                <option value="expired">{sv ? 'Utgången' : 'Expired'}</option>
                <option value="cancelled">{sv ? 'Avbruten' : 'Cancelled'}</option>
                <option value="paused">{sv ? 'Pausad' : 'Paused'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Plan' : 'Plan'}</label>
              <select name="planId" defaultValue={mem.planId || ''} className="border rounded-lg px-3 py-2 w-full">
                {plans.map(p => <option key={p.id} value={p.id}>{p.nameSv} ({Math.round(Number(p.priceSek))} kr)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{sv ? 'Slutdatum' : 'End date'}</label>
              <input name="periodEnd" type="date" defaultValue={toLocalInput(mem.periodEnd)} className="border rounded-lg px-3 py-2 w-full" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-[#58595b] text-white rounded-lg hover:bg-[#6b6c6e] font-medium">
            {sv ? 'Spara' : 'Save'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-3">{sv ? 'Orderhistorik' : 'Order history'} ({userOrders.length})</h2>
        {userOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">{sv ? 'Inga ordrar' : 'No orders'}</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{sv ? 'Datum' : 'Date'}</th>
            </tr></thead>
            <tbody className="divide-y">
              {userOrders.map(o => (
                <tr key={o.id}>
                  <td className="px-4 py-2 text-sm"><a href={`/${locale}/admin/orders/${o.id}`} className="text-blue-600 hover:underline">#{o.orderNumber}</a></td>
                  <td className="px-4 py-2 text-sm">{Math.round(Number(o.totalSek))} kr</td>
                  <td className="px-4 py-2 text-sm">{o.status}</td>
                  <td className="px-4 py-2 text-sm">{new Date(o.createdAt).toLocaleDateString('sv-SE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
