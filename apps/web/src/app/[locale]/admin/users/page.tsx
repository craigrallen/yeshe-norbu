import { createDb, users, userRoles } from '@yeshe/db';
import { sql, desc } from 'drizzle-orm';

export default async function AdminUsers({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { q?: string } }) {
  const sv = locale === 'sv';
  const db = createDb(process.env.DATABASE_URL!);
  const q = (searchParams.q || '').trim();

  const whereSql = q
    ? sql`${users.deletedAt} IS NULL AND (
        ${users.email} ILIKE ${`%${q}%`} OR
        ${users.firstName} ILIKE ${`%${q}%`} OR
        ${users.lastName} ILIKE ${`%${q}%`} OR
        ${users.id}::text ILIKE ${`%${q}%`}
      )`
    : sql`${users.deletedAt} IS NULL`;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      locale: users.locale,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereSql)
    .orderBy(desc(users.createdAt))
    .limit(300);

  const roleRows = await db.select({ userId: userRoles.userId, role: userRoles.role }).from(userRoles);
  const roleMap = new Map<string, string[]>();
  for (const r of roleRows) {
    const existing = roleMap.get(r.userId) || [];
    existing.push(r.role);
    roleMap.set(r.userId, existing);
  }

  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(sql`deleted_at IS NULL`);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Användare' : 'Users'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total.count} {sv ? 'användare totalt' : 'total users'}
            {q ? ` · ${rows.length} ${sv ? 'träffar' : 'matches'}` : ` (${sv ? 'visar senaste 300' : 'showing latest 300'})`}
          </p>
        </div>
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder={sv ? 'Sök namn, e-post eller ID...' : 'Search name, email or ID...'}
            className="w-80 max-w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button className="px-3 py-2 rounded-lg bg-[#58595b] text-white text-sm">{sv ? 'Sök' : 'Search'}</button>
          {q && <a href={`/${locale}/admin/users`} className="text-sm text-gray-500 hover:underline">{sv ? 'Rensa' : 'Clear'}</a>}
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Namn' : 'Name'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'E-post' : 'Email'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Roll' : 'Role'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Registrerad' : 'Joined'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium"><a href={`/${locale}/admin/users/${u.id}`} className="text-blue-600 hover:underline">{u.firstName} {u.lastName}</a></td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm">
                  {(roleMap.get(u.id) || []).map((r) => (
                    <span key={r} className="inline-block mr-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">{r}</span>
                  ))}
                  {!(roleMap.get(u.id) || []).length && <span className="text-gray-400 text-xs">{sv ? 'användare' : 'user'}</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('sv-SE')}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">{sv ? 'Inga användare hittades' : 'No users found'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
