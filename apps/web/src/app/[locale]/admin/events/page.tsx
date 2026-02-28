const events = [
  { id: 1, title: 'Introduktion till Mindfulness', date: '2026-03-04', time: '18:30', location: 'Yeshe Norbu Center', capacity: 20, registered: 12, status: 'Publicerad' },
  { id: 2, title: 'Lam Rim – vecka 3', date: '2026-03-06', time: '19:00', location: 'Online', capacity: 15, registered: 8, status: 'Publicerad' },
  { id: 3, title: 'Retreat: Tystnadens kraft', date: '2026-03-14', time: 'Helg', location: 'Utanför Stockholm', capacity: 10, registered: 7, status: 'Publicerad' },
  { id: 4, title: 'Meditation och hjärnforskning', date: '2026-03-20', time: '18:00', location: 'Yeshe Norbu Center', capacity: 30, registered: 0, status: 'Utkast' },
];

export default function AdminEvents({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Evenemang' : 'Events'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera evenemang och biljetter' : 'Manage events and tickets'}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + {sv ? 'Nytt evenemang' : 'New event'}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Titel' : 'Title'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Plats' : 'Location'}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{sv ? 'Platser' : 'Capacity'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.date} · {e.time}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.location}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-medium ${e.registered >= e.capacity ? 'text-red-600' : 'text-gray-900'}`}>
                    {e.registered}/{e.capacity}
                  </span>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (e.registered/e.capacity)*100)}%` }} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${e.status === 'Publicerad' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{sv ? 'Redigera' : 'Edit'}</button>
                  <button className="text-gray-400 hover:text-red-600 text-sm">{sv ? 'Ta bort' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
