import { createDb, users, userRoles } from '@yeshe/db';
import { sql, desc, eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function createCustomer(formData: FormData) {
  'use server';
  const db = createDb(process.env.DATABASE_URL!);
  const locale = String(formData.get('locale') || 'sv');
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const userLocale = String(formData.get('userLocale') || 'sv').trim();

  if (!firstName || !lastName || !email) return;

  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists.length) return;

  const tempPass = `temp-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const passwordHash = await hashPassword(tempPass);

  const [u] = await db.insert(users).values({
    firstName,
    lastName,
    email,
    phone: phone || null,
    locale: userLocale,
    passwordHash,
    emailVerified: false,
    consentMarketing: false,
  }).returning({ id: users.id });

  if (u?.id) {
    await db.insert(userRoles).values({ userId: u.id, role: 'customer' as any });
  }

  revalidatePath(`/${locale}/admin/users`);
}

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
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Kunder' : 'Customers'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total.count} {sv ? 'kunder totalt' : 'total customers'}
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold mb-3">{sv ? 'Skapa kund manuellt' : 'Create customer manually'}</h2>
        <form action={createCustomer} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
          <input type="hidden" name="locale" value={locale} />
          <input name="firstName" placeholder={sv ? 'Förnamn' : 'First name'} className="border rounded px-3 py-2 md:col-span-1" required />
          <input name="lastName" placeholder={sv ? 'Efternamn' : 'Last name'} className="border rounded px-3 py-2 md:col-span-1" required />
          <input name="email" type="email" placeholder="email@example.com" className="border rounded px-3 py-2 md:col-span-2" required />
          <input name="phone" placeholder={sv ? 'Telefon' : 'Phone'} className="border rounded px-3 py-2 md:col-span-1" />
          <div className="flex gap-2 md:col-span-1">
            <select name="userLocale" defaultValue={locale} className="border rounded px-2 py-2 text-sm">
              <option value="sv">sv</option>
              <option value="en">en</option>
            </select>
            <button className="px-3 py-2 rounded bg-[#58595b] text-white text-sm whitespace-nowrap">+ {sv ? 'Skapa' : 'Create'}</button>
          </div>
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
                  {!(roleMap.get(u.id) || []).length && <span className="text-gray-400 text-xs">{sv ? 'kund' : 'customer'}</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString('sv-SE')}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">{sv ? 'Inga kunder hittades' : 'No customers found'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
