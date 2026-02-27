import { NextRequest, NextResponse } from 'next/server';
import { createDb, events, eventCategories, ticketTypes, teachers } from '@yeshe/db';
import { eq, gte, asc } from 'drizzle-orm';

/**
 * GET /api/events - List upcoming published events.
 * Query params: category, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const db = createDb(process.env.DATABASE_URL!);
    const now = new Date();

    let query = db
      .select({
        id: events.id,
        slug: events.slug,
        titleSv: events.titleSv,
        titleEn: events.titleEn,
        descriptionSv: events.descriptionSv,
        descriptionEn: events.descriptionEn,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        venue: events.venue,
        isOnline: events.isOnline,
        featuredImageUrl: events.featuredImageUrl,
        categorySlug: eventCategories.slug,
        categoryNameSv: eventCategories.nameSv,
        categoryNameEn: eventCategories.nameEn,
        teacherNameSv: teachers.nameSv,
        teacherNameEn: teachers.nameEn,
      })
      .from(events)
      .leftJoin(eventCategories, eq(events.categoryId, eventCategories.id))
      .leftJoin(teachers, eq(events.teacherId, teachers.id))
      .where(gte(events.startsAt, now))
      .orderBy(asc(events.startsAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    return NextResponse.json({ events: results, count: results.length });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
