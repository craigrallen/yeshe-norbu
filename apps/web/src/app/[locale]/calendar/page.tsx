import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay() || 7;
  const days: (number | null)[] = [];
  for (let i = 1; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  while (days.length % 7) days.push(null);
  return days;
}

const MONTHS_SV = ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SV = ['Mån','Tis','Ons','Tor','Fre','Lör','Sön'];
const DAYS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default async function CalendarPage({ params: { locale }, searchParams }: { params: { locale: string }; searchParams: { m?: string; y?: string } }) {
  const sv = locale === 'sv';
  const now = new Date();
  const year = parseInt(searchParams.y || '') || now.getFullYear();
  const month = (parseInt(searchParams.m || '') || (now.getMonth() + 1)) - 1;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

  const { rows: events } = await pool.query(
    `SELECT id, slug,
            COALESCE(NULLIF(title_sv,''), title_en) as title_sv_fallback,
            COALESCE(NULLIF(title_en,''), title_sv) as title_en_fallback,
            starts_at, ends_at, venue, published,
            EXTRACT(DAY FROM (starts_at AT TIME ZONE 'Europe/Stockholm'))::int as local_day
     FROM events
     WHERE starts_at >= $1 AND starts_at <= $2 AND published = true
     ORDER BY starts_at`,
    [firstDay.toISOString(), lastDay.toISOString()]
  );

  const eventsByDay: Record<number, any[]> = {};
  for (const e of events) {
    const d = e.local_day;
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(e);
  }

  const days = getMonthDays(year, month);
  const prevMonth = month === 0 ? 12 : month;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 1 : month + 2;
  const nextYear = month === 11 ? year + 1 : year;
  const dayNames = sv ? DAYS_SV : DAYS_EN;
  const monthName = sv ? MONTHS_SV[month] : MONTHS_EN[month];

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <div className="bg-[#58595b] text-white py-12 px-4"><div className="max-w-5xl mx-auto text-center"><h1 className="text-4xl font-bold">{sv ? 'Kalender' : 'Calendar'}</h1></div></div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <a href={`/${locale}/calendar?m=${prevMonth}&y=${prevYear}`} className="text-sm text-blue-600 hover:underline">&larr; {sv ? 'Föregående' : 'Previous'}</a>
          <h2 className="text-2xl font-bold text-gray-900">{monthName} {year}</h2>
          <a href={`/${locale}/calendar?m=${nextMonth}&y=${nextYear}`} className="text-sm text-blue-600 hover:underline">{sv ? 'Nästa' : 'Next'} &rarr;</a>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b">{dayNames.map(d => <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>)}</div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => (
              <div key={i} className={("min-h-[110px] border-b border-r p-2 ") + (day ? 'bg-white' : 'bg-gray-50')}>
                {day && (
                  <>
                    <div className={("text-sm font-medium mb-1 ") + (day === now.getDate() && month === now.getMonth() && year === now.getFullYear() ? 'text-blue-600 font-bold' : 'text-gray-700')}>{day}</div>
                    {(eventsByDay[day] || []).map((e) => {
                      const href = e.slug ? `/${locale}/events/${e.slug}` : `/${locale}/events`;
                      return (
                        <a key={e.id} href={href} className="block text-xs bg-[#f5ca00] text-white rounded px-1.5 py-0.5 mb-1 truncate hover:bg-[#d4af00]" title={sv ? e.title_sv_fallback : e.title_en_fallback}>
                          {sv ? e.title_sv_fallback : e.title_en_fallback}
                        </a>
                      );
                    })}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">{sv ? 'Evenemang denna månad' : 'Events this month'} ({events.length})</h3>
          <div className="space-y-3">
            {events.map((e: any) => {
              const href = e.slug ? `/${locale}/events/${e.slug}` : `/${locale}/events`;
              return (
                <a key={e.id} href={href} className="block bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{sv ? e.title_sv_fallback : e.title_en_fallback}</p>
                      <p className="text-sm text-gray-500">{e.venue || 'Yeshin Norbu, Stockholm'}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(e.starts_at).toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' })}</p>
                      <p>{new Date(e.starts_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })}</p>
                    </div>
                  </div>
                </a>
              );
            })}
            {events.length === 0 && <p className="text-gray-400 text-center py-8">{sv ? 'Inga evenemang denna månad' : 'No events this month'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
