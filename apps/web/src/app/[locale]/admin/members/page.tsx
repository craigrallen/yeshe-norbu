const members = [
  { id: 1, name: 'Anna Lindström', email: 'anna@example.com', tier: 'Non-Profit', start: '2023-05-14', end: '2024-05-14', status: 'Aktiv' },
  { id: 2, name: 'Erik Johansson', email: 'erik@example.com', tier: 'Gym Card', start: '2024-01-01', end: '2026-03-01', status: 'Aktiv' },
  { id: 3, name: 'Maria Svensson', email: 'maria@example.com', tier: 'Friend', start: '2024-06-15', end: '2025-06-15', status: 'Aktiv' },
  { id: 4, name: 'Lars Petersson', email: 'lars@example.com', tier: 'Non-Profit', start: '2022-11-20', end: '2023-11-20', status: 'Utgången' },
  { id: 5, name: 'Sofia Nilsson', email: 'sofia@example.com', tier: 'Gym Card', start: '2025-08-01', end: '2026-02-20', status: 'Avbruten' },
];

export default function AdminMembers({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Medlemmar' : 'Members'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera medlemskap och nivåer' : 'Manage memberships and tiers'}</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option>{sv ? 'Alla nivåer' : 'All tiers'}</option>
            <option>Friend</option>
            <option>Non-Profit</option>
            <option>Gym Card</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option>{sv ? 'Alla status' : 'All statuses'}</option>
            <option>{sv ? 'Aktiv' : 'Active'}</option>
            <option>{sv ? 'Utgången' : 'Expired'}</option>
            <option>{sv ? 'Avbruten' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="text-3xl font-bold text-gray-900">743</div>
          <div className="text-sm font-medium text-gray-700 mt-1">{sv ? 'Aktiva medlemmar' : 'Active members'}</div>
          <div className="text-xs text-gray-500 mt-1">87% av totalt 852</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
          <div className="text-3xl font-bold text-gray-900">54 kr</div>
          <div className="text-sm font-medium text-gray-700 mt-1">{sv ? 'Genomsnittlig årsintäkt' : 'Avg. annual revenue'}</div>
          <div className="text-xs text-gray-500 mt-1">{sv ? 'per medlem' : 'per member'}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          <div className="text-3xl font-bold text-gray-900">67</div>
          <div className="text-sm font-medium text-gray-700 mt-1">{sv ? 'Utgår inom 30 dagar' : 'Expiring in 30 days'}</div>
          <div className="text-xs text-gray-500 mt-1">{sv ? 'Skicka påminnelse' : 'Send reminder'}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Medlem' : 'Member'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Nivå' : 'Tier'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Startdatum' : 'Start Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Slutdatum' : 'End Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {m.tier}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.start}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{m.end}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    m.status === 'Aktiv' ? 'bg-green-100 text-green-800' :
                    m.status === 'Utgången' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{sv ? 'Hantera' : 'Manage'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
