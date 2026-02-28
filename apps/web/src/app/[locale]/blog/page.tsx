const posts = [
  { slug: 'fpmt-och-yeshe-norbu', title: 'FPMT och Yeshin Norbu', excerpt: 'Lär dig om FPMT och hur Yeshin Norbu i Stockholm är en del av detta globala andliga nätverk.', date: '28 feb 2026', category: 'Undervisning' },
  { slug: 'mindfulness-i-vardagen', title: 'Mindfulness i vardagen', excerpt: 'Fem konkreta mindfulnessövningar för dig som vill skapa mer närvaro i vardagen.', date: '28 feb 2026', category: 'Mindfulness' },
  { slug: 'vad-ar-meditation', title: 'Vad är meditation?', excerpt: 'Meditation är inte att tömma sinnet. Det är att träna uppmärksamheten. En nybörjarguide.', date: '28 feb 2026', category: 'Undervisning' },
  { slug: 'mindfulness-och-hjarnforskning', title: 'Mindfulness och hjärnforskning', excerpt: 'Vad säger vetenskapen om mindfulness? En översikt över den senaste forskningen.', date: '28 feb 2026', category: 'Mindfulness' },
  { slug: 'valkomna-till-yeshe-norbu', title: 'Välkommen till Yeshin Norbu', excerpt: 'Ett öppet och inkluderande center i Stockholm för alla som är intresserade av meditation och buddhism.', date: '28 feb 2026', category: 'Gemenskap' },
];

export default function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{sv ? 'Blogg' : 'Blog'}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {sv ? 'Artiklar om meditation, mindfulness, buddhistisk filosofi och praktik.' : 'Articles on meditation, mindfulness, Buddhist philosophy and practice.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((p) => (
          <a key={p.slug} href={`/${locale}/blog/${p.slug}`} className="group">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl">
                ☸️
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{p.category}</span>
                  <span className="text-gray-500">{p.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.excerpt}</p>
                <div className="pt-2">
                  <span className="text-blue-600 text-sm font-medium group-hover:underline">{sv ? 'Läs mer' : 'Read more'} →</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
