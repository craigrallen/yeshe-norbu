import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import fs from 'fs';

// Load real extracted events data
function loadEvents() {
  try {
    const emPath = '/app/migration/extracted/wp_em_events.json';
    const localPath = process.cwd() + '/../../migration/extracted/wp_em_events.json';
    const path = fs.existsSync(localPath) ? localPath : emPath;
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
  } catch {
    return [];
  }
}

// Curated upcoming events (real data from EM + hardcoded recent ones)
const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'Meditationsretreatt med Geshe Namdak Tenzin',
    titleEn: 'Meditation Retreat with Geshe Namdak Tenzin',
    date: '2025-03-14',
    endDate: '2025-03-16',
    time: '18:00',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Retreatt',
    priceSek: 1200,
    spotsLeft: 12,
    totalSpots: 20,
    slug: 'meditationsretreatt-mars-2025',
  },
  {
    id: 2,
    title: 'Introduktion till buddhistisk meditation',
    titleEn: 'Introduction to Buddhist Meditation',
    date: '2025-03-21',
    endDate: '2025-03-21',
    time: '18:30',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Nybörjare',
    priceSek: 150,
    spotsLeft: 28,
    totalSpots: 30,
    slug: 'intro-meditation-mars-2025',
  },
  {
    id: 3,
    title: 'Hjärtats visdom – veckovisa meditationer',
    titleEn: 'Wisdom of the Heart – Weekly Meditation',
    date: '2025-03-28',
    endDate: '2025-03-28',
    time: '18:30',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Veckomeditation',
    priceSek: 100,
    spotsLeft: 35,
    totalSpots: 40,
    slug: 'veckomeditation-mars-2025',
  },
  {
    id: 4,
    title: 'FPMT-dag: Bodhichitta och medkänsla',
    titleEn: 'FPMT Day: Bodhichitta and Compassion',
    date: '2025-04-05',
    endDate: '2025-04-05',
    time: '10:00',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Studier',
    priceSek: 250,
    spotsLeft: 20,
    totalSpots: 25,
    slug: 'fpmt-dag-april-2025',
  },
  {
    id: 5,
    title: 'Tyst retreatt – en dag av tystnad',
    titleEn: 'Silent Day Retreat',
    date: '2025-04-12',
    endDate: '2025-04-12',
    time: '09:00',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Retreatt',
    priceSek: 500,
    spotsLeft: 8,
    totalSpots: 15,
    slug: 'tyst-retreatt-april-2025',
  },
  {
    id: 6,
    title: 'Dödsmeditation och bardo – serie 1',
    titleEn: 'Death Meditation and Bardo – Series 1',
    date: '2025-04-19',
    endDate: '2025-04-19',
    time: '14:00',
    location: 'Yeshin Norbu, Stockholm',
    category: 'Studier',
    priceSek: 200,
    spotsLeft: 22,
    totalSpots: 30,
    slug: 'dodsmeditation-april-2025',
  },
];

const CATEGORIES = ['Alla', 'Retreatt', 'Veckomeditation', 'Nybörjare', 'Studier'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function spotsColor(left: number, total: number) {
  const pct = left / total;
  if (pct > 0.5) return 'text-green-600';
  if (pct > 0.2) return 'text-amber-500';
  return 'text-red-500';
}

export default async function EventsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });
  const isSv = locale === 'sv';

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {/* Hero */}
      <div className="bg-[#58595b] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isSv ? 'Evenemang & Retreatter' : 'Events & Retreats'}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {isSv
              ? 'Välkommen till våra meditationskvällar, studiedagar och retreatter i Stockholm.'
              : 'Join us for meditation evenings, study days and retreats in Stockholm.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Events grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPCOMING_EVENTS.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              {/* Color bar by category */}
              <div className={`h-1.5 ${
                event.category === 'Retreatt' ? 'bg-[#f5ca00]' :
                event.category === 'Nybörjare' ? 'bg-green-500' :
                event.category === 'Studier' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />

              <div className="p-5 flex flex-col flex-1">
                {/* Category + date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#f5ca00] bg-[#FFF9EE] px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                </div>

                {/* Title */}
                <h2 className="font-bold text-[#58595b] text-lg mb-2 leading-snug">
                  {isSv ? event.title : event.titleEn}
                </h2>

                {/* Details */}
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>🕐 {event.time}</p>
                  <p>📍 {event.location}</p>
                </div>

                {/* Spots */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{isSv ? 'Platser kvar' : 'Spots left'}</span>
                    <span className={spotsColor(event.spotsLeft, event.totalSpots)}>
                      {event.spotsLeft} / {event.totalSpots}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        event.spotsLeft / event.totalSpots > 0.5 ? 'bg-green-400' :
                        event.spotsLeft / event.totalSpots > 0.2 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${(event.spotsLeft / event.totalSpots) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xl font-bold text-[#58595b]">
                    {event.priceSek === 0 ? (isSv ? 'Gratis' : 'Free') : `${event.priceSek} kr`}
                  </p>
                  <a
                    href={`/${locale}/checkout?name=${encodeURIComponent(isSv ? event.title : event.titleEn)}&amount=${event.priceSek}&type=event&ref=${event.slug}`}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      event.spotsLeft === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#f5ca00] text-white hover:bg-[#d4af00]'
                    }`}
                  >
                    {event.spotsLeft === 0
                      ? (isSv ? 'Fullbokat' : 'Fully booked')
                      : (isSv ? 'Boka plats' : 'Book now')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Donate CTA */}
        <div className="mt-16 bg-[#58595b] rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {isSv ? 'Stöd vårt arbete' : 'Support our work'}
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            {isSv
              ? 'Yeshin Norbu är en ideell organisation. Dina bidrag gör det möjligt för oss att erbjuda undervisning och retreatter.'
              : 'Yeshin Norbu is a non-profit. Your donations make it possible for us to offer teachings and retreats.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {[100, 250, 500].map(amt => (
              <a
                key={amt}
                href={`/${locale}/checkout?name=${encodeURIComponent(isSv ? 'Donation till Yeshin Norbu' : 'Donation to Yeshin Norbu')}&amount=${amt}&type=donation`}
                className="bg-[#f5ca00] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d4af00] transition-colors"
              >
                {amt} kr
              </a>
            ))}
            <a
              href={`/${locale}/checkout?name=${encodeURIComponent(isSv ? 'Valfri donation' : 'Custom donation')}&amount=200&type=donation`}
              className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-[#58595b] transition-colors"
            >
              {isSv ? 'Valfritt belopp' : 'Custom amount'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
