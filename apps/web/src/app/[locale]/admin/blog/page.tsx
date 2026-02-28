const posts = [
  { slug: 'fpmt-och-yeshe-norbu', title: 'FPMT och Yeshin Norbu', category: 'Undervisning', date: '2026-02-28', status: 'Publicerad', views: 0 },
  { slug: 'mindfulness-i-vardagen', title: 'Mindfulness i vardagen', category: 'Mindfulness', date: '2026-02-28', status: 'Publicerad', views: 0 },
  { slug: 'vad-ar-meditation', title: 'Vad är meditation?', category: 'Undervisning', date: '2026-02-28', status: 'Publicerad', views: 0 },
  { slug: 'mindfulness-och-hjarnforskning', title: 'Mindfulness och hjärnforskning', category: 'Mindfulness', date: '2026-02-28', status: 'Publicerad', views: 0 },
  { slug: 'valkomna-till-yeshe-norbu', title: 'Välkommen till Yeshin Norbu', category: 'Gemenskap', date: '2026-02-28', status: 'Publicerad', views: 0 },
];

export default function AdminBlog({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sv ? 'Blogg' : 'Blog'}</h1>
          <p className="text-gray-500 text-sm mt-1">{sv ? 'Hantera blogginlägg' : 'Manage blog posts'}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          + {sv ? 'Nytt inlägg' : 'New post'}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Titel' : 'Title'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Kategori' : 'Category'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{sv ? 'Datum' : 'Date'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((p) => (
              <tr key={p.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.title}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{p.category}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.date}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">{p.status}</span></td>
                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                  <a href={`/${locale}/blog/${p.slug}`} className="text-gray-500 hover:text-gray-900 text-sm">{sv ? 'Visa' : 'View'}</a>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{sv ? 'Redigera' : 'Edit'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
