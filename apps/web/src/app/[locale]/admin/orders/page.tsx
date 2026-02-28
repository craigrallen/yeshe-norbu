const orders = [
  { id: '#4821', customer: 'Anna Lindström', email: 'anna@example.com', date: '2026-02-28', amount: '350 kr', status: 'Betald', payment: 'Stripe' },
  { id: '#4820', customer: 'Erik Johansson', email: 'erik@example.com', date: '2026-02-27', amount: '890 kr', status: 'Betald', payment: 'Swish' },
  { id: '#4819', customer: 'Maria Svensson', email: 'maria@example.com', date: '2026-02-27', amount: '350 kr', status: 'Väntar', payment: 'Stripe' },
  { id: '#4818', customer: 'Lars Petersson', email: 'lars@example.com', date: '2026-02-26', amount: '1 250 kr', status: 'Betald', payment: 'Stripe' },
  { id: '#4817', customer: 'Sofia Nilsson', email: 'sofia@example.com', date: '2026-02-25', amount: '350 kr', status: 'Återbetald', payment: 'Stripe' },
];

export default function AdminOrders({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Beställningar' : 'Orders'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera beställningar och betalningar' : 'Manage orders and payments'}</p>
        </div>
        <select className="px-4 py-2 border border-gray-200 rounded-lg">
          <option>{sv ? 'Alla status' : 'All statuses'}</option>
          <option>{sv ? 'Betald' : 'Paid'}</option>
          <option>{sv ? 'Väntar' : 'Pending'}</option>
          <option>{sv ? 'Återbetald' : 'Refunded'}</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Order' : 'Order'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Kund' : 'Customer'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{sv ? 'Belopp' : 'Amount'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Betalning' : 'Payment'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{o.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{o.customer}</div>
                  <div className="text-xs text-gray-500">{o.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{o.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.payment}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    o.status === 'Betald' ? 'bg-green-100 text-green-800' :
                    o.status === 'Väntar' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{sv ? 'Visa' : 'View'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
