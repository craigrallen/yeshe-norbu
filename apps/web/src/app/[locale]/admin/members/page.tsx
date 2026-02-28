import { createDb, memberships, users, membershipPlans } from '@yeshe/db';
import { sql, eq, desc } from 'drizzle-orm';

export default async function AdminMembers({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);

  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(memberships);
  const [active] = await db.select({ count: sql<number>`count(*)::int` }).from(memberships).where(eq(memberships.status, 'active'));

  const rows = await db
    .select({
      id: memberships.id,
      status: memberships.status,
      currentPeriodStart: memberships.currentPeriodStart,
      currentPeriodEnd: memberships.currentPeriodEnd,
      createdAt: memberships.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      planNameSv: membershipPlans.nameSv,
      planNameEn: membershipPlans.nameEn,
    })
    .from(memberships)
    .leftJoin(users, eq(memberships.userId, users.id))
    .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
    .orderBy(desc(memberships.createdAt))
    .limit(200);

  const statusLabel: Record<string, string> = {
    active: sv ? 'Aktiv' : 'Active',
    expired: sv ? 'Utgången' : 'Expired',
    cancelled: sv ? 'Avbruten' : 'Cancelled',
    paused: sv ? 'Pausad' : 'Paused',
  };
  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Medlemmar' : 'Members'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total.count} {sv ? 'totalt' : 'total'}, {active.count} {sv ? 'aktiva' : 'active'} ({sv ? 'visar senaste 200' : 'showing latest 200'})
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Namn' : 'Name'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'E-post' : 'Email'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Plan' : 'Plan'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Period' : 'Period'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{m.email || '\u2014'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{(sv ? m.planNameSv : m.planNameEn) || '\u2014'}</td>
                <td className="px-6 py-4">
                  <span className={"px-2 py-1 text-xs rounded-full font-medium " + (statusColor[m.status] || 'bg-gray-100 text-gray-800')}>
                    {statusLabel[m.status] || m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(m.currentPeriodStart).toLocaleDateString('sv-SE')} — {new Date(m.currentPeriodEnd).toLocaleDateString('sv-SE')}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">{sv ? 'Inga medlemmar ännu' : 'No members yet'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
