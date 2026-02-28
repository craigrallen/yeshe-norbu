import { getTranslations } from 'next-intl/server';

const stats = [
  { label: 'Aktiva medlemmar', labelEn: 'Active members', value: '852', icon: '👥', trend: '+12%', color: 'bg-blue-50 border-blue-200' },
  { label: 'Kommande evenemang', labelEn: 'Upcoming events', value: '12', icon: '📅', trend: 'nästa 30 dagar', color: 'bg-green-50 border-green-200' },
  { label: 'Beställningar denna månad', labelEn: 'Orders this month', value: '47', icon: '🛍️', trend: '+8%', color: 'bg-yellow-50 border-yellow-200' },
  { label: 'Totalt antal användare', labelEn: 'Total users', value: '1,191', icon: '🧑‍🤝‍🧑', trend: 'registrerade', color: 'bg-purple-50 border-purple-200' },
];

const recentOrders = [
  { id: '#4821', customer: 'Anna Lindström', amount: '350 kr', status: 'Betald', date: '2026-02-28', statusColor: 'text-green-600' },
  { id: '#4820', customer: 'Erik Johansson', amount: '890 kr', status: 'Betald', date: '2026-02-27', statusColor: 'text-green-600' },
  { id: '#4819', customer: 'Maria Svensson', amount: '350 kr', status: 'Väntar', date: '2026-02-27', statusColor: 'text-yellow-600' },
  { id: '#4818', customer: 'Lars Petersson', amount: '1 250 kr', status: 'Betald', date: '2026-02-26', statusColor: 'text-green-600' },
  { id: '#4817', customer: 'Sofia Nilsson', amount: '350 kr', status: 'Återbetald', date: '2026-02-25', statusColor: 'text-red-600' },
];

const upcomingEvents = [
  { title: 'Introduktion till Mindfulness', date: '4 mars', attendees: 12, capacity: 20 },
  { title: 'Lam Rim – vecka 3', date: '6 mars', attendees: 8, capacity: 15 },
  { title: 'Retreat: Tystnadens kraft', date: '14–16 mars', attendees: 7, capacity: 10 },
];

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Översikt' : 'Dashboard'}</h1>
        <p className="text-gray-500 text-sm mt-1">{sv ? 'Välkommen tillbaka. Här är en sammanfattning.' : 'Welcome back. Here is a summary.'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{sv ? s.label : s.labelEn}</div>
            <div className="text-xs text-gray-500 mt-1">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Senaste beställningar' : 'Recent Orders'}</h2>
            <a href={`/${locale}/admin/orders`} className="text-xs text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">{sv ? 'Kund' : 'Customer'}</th>
                <th className="px-4 py-2 text-right">{sv ? 'Belopp' : 'Amount'}</th>
                <th className="px-4 py-2 text-left">{sv ? 'Status' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-500">{o.id}</td>
                  <td className="px-4 py-3 text-gray-900">{o.customer}</td>
                  <td className="px-4 py-3 text-right font-medium">{o.amount}</td>
                  <td className={`px-4 py-3 font-medium ${o.statusColor}`}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h2>
            <a href={`/${locale}/admin/events`} className="text-xs text-blue-600 hover:underline">{sv ? 'Visa alla' : 'View all'}</a>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.map((e) => (
              <div key={e.title} className="px-5 py-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{e.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{e.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{e.attendees}/{e.capacity}</div>
                  <div className="text-xs text-gray-500">{sv ? 'deltagare' : 'attendees'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
