const users = [
  { id: 1, name: 'Anna Lindström', email: 'anna@example.com', role: 'Medlem', joined: '2023-05-14', status: 'Aktiv' },
  { id: 2, name: 'Erik Johansson', email: 'erik@example.com', role: 'Admin', joined: '2022-11-02', status: 'Aktiv' },
  { id: 3, name: 'Maria Svensson', email: 'maria@example.com', role: 'Medlem', joined: '2024-01-18', status: 'Aktiv' },
  { id: 4, name: 'Lars Petersson', email: 'lars@example.com', role: 'Lärare', joined: '2023-08-22', status: 'Aktiv' },
  { id: 5, name: 'Sofia Nilsson', email: 'sofia@example.com', role: 'Medlem', joined: '2025-12-01', status: 'Inaktiv' },
];

export default function AdminUsers({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Användare' : 'Users'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera användare och roller' : 'Manage users and roles'}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {sv ? 'Ny användare' : 'New User'}
        </button>
      </div>

      <div className="flex gap-4">
        <input type="search" placeholder={sv ? 'Sök användare...' : 'Search users...'} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" />
        <select className="px-4 py-2 border border-gray-200 rounded-lg">
          <option value="all">{sv ? 'Alla roller' : 'All roles'}</option>
          <option value="admin">Admin</option>
          <option value="member">{sv ? 'Medlem' : 'Member'}</option>
          <option value="teacher">{sv ? 'Lärare' : 'Teacher'}</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Namn' : 'Name'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Roll' : 'Role'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Registrerad' : 'Joined'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.joined}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${u.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{sv ? 'Redigera' : 'Edit'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>{sv ? 'Visar 5 av 1,191 användare' : 'Showing 5 of 1,191 users'}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">{sv ? 'Föregående' : 'Previous'}</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">{sv ? 'Nästa' : 'Next'}</button>
        </div>
      </div>
    </div>
  );
}
