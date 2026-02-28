import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function toIcalDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
}

function escapeIcal(s: string) {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET() {
  const { rows } = await pool.query(
    `SELECT e.slug, e.title_en, e.title_sv, e.starts_at, e.ends_at, e.venue, e.description_en, e.id
     FROM events e WHERE e.published = true ORDER BY e.starts_at`
  );

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yeshin Norbu//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Yeshin Norbu Events',
  ];

  for (const e of rows) {
    const start = new Date(e.starts_at);
    const end = e.ends_at ? new Date(e.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.id}@yeshinnorbu.se`);
    lines.push(`DTSTART:${toIcalDate(start)}`);
    lines.push(`DTEND:${toIcalDate(end)}`);
    lines.push(`SUMMARY:${escapeIcal(e.title_en || e.title_sv)}`);
    if (e.venue) lines.push(`LOCATION:${escapeIcal(e.venue)}`);
    if (e.description_en) lines.push(`DESCRIPTION:${escapeIcal(e.description_en).slice(0, 500)}`);
    lines.push(`URL:https://yeshinnorbu.se/en/events/${e.slug}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="yeshin-norbu-events.ics"',
    },
  });
}
