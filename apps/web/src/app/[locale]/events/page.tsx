const events = [
  { id: 1, title: 'Introduktion till Mindfulness', date: '4 mars 2026', time: '18:30', location: 'Yeshe Norbu Center', price: 'Gratis', image: '/events/mindfulness-intro.jpg' },
  { id: 2, title: 'Lam Rim – Upplysningens väg (vecka 3)', date: '6 mars 2026', time: '19:00', location: 'Online', price: '150 kr', image: '/events/lam-rim.jpg' },
  { id: 3, title: 'Retreat: Tystnadens kraft', date: '14–16 mars 2026', time: 'Helg', location: 'Landsbygden utanför Stockholm', price: '2 500 kr', image: '/events/retreat.jpg' },
  { id: 4, title: 'Meditation och hjärnforskning', date: '20 mars 2026', time: '18:00', location: 'Yeshe Norbu Center', price: 'Gratis', image: '/events/neuroscience.jpg' },
  { id: 5, title: 'Tonglen: att ge och ta', date: '27 mars 2026', time: '19:00', location: 'Online', price: '100 kr', image: '/events/tonglen.jpg' },
  { id: 6, title: 'Veckovis drop-in meditation', date: 'Varje tisdag', time: '07:00', location: 'Yeshe Norbu Center', price: 'Fri donation', image: '/events/drop-in.jpg' },
];

export default function EventsPage({ params: { locale } }: { params: { locale: string } }) {
  const sv = locale === 'sv';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{sv ? 'Kommande evenemang' : 'Upcoming Events'}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {sv ? 'Utforska vårt schema med meditationer, kurser, föreläsningar och retreats. Alla nivåer välkomna.' : 'Explore our schedule of meditations, courses, talks, and retreats. All levels welcome.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((e) => (
          <div key={e.id} className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-6xl">
              🧘‍♀️
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{e.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{e.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>{e.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{e.location}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-900">{e.price}</span>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
                  {sv ? 'Anmäl dig' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
