import { requireAdmin } from '@/lib/authz';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function AuditLogPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  await requireAdmin(locale);

  let entries: any[] = [];
  try {
    const { rows } = await pool.query(`
      SELECT al.id, al.timestamp, al.action, al.description, al.metadata,
             u.first_name AS user_first, u.last_name AS user_last,
             s.first_name AS staff_first, s.last_name AS staff_last
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN users s ON s.id = al.staff_user_id
      ORDER BY al.timestamp DESC
      LIMIT 50
    `);
    entries = rows;
  } catch {}

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sv ? 'Aktivitetslogg' : 'Audit Log'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sv ? 'Senaste 50 händelserna' : 'Latest 50 events'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Tidpunkt' : 'Timestamp'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Åtgärd' : 'Action'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Användare' : 'User'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{sv ? 'Detaljer' : 'Details'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                  {new Date(e.timestamp).toLocaleString(sv ? 'sv-SE' : 'en-GB')}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">{e.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {e.staff_first ? `${e.staff_first} ${e.staff_last}` : e.user_first ? `${e.user_first} ${e.user_last}` : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{e.description || '—'}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{sv ? 'Inga loggposter.' : 'No log entries.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
