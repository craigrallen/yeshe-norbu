import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@yeshe/auth/middleware';
import { createDb, users, orders, orderItems, memberships, courseEnrollments, donations, eventRegistrations } from '@yeshe/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/gdpr/export - Export all personal data for the authenticated user.
 * GDPR Article 20: Right to data portability.
 */
export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request, process.env.JWT_SECRET!);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = createDb(process.env.DATABASE_URL!);
    const userId = auth.sub;

    const [userData] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      locale: users.locale,
      consentMarketing: users.consentMarketing,
      consentAnalytics: users.consentAnalytics,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId));

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));

    const userMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId));

    const userEnrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));

    const userDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, userId));

    const userRegistrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId));

    const exportData = {
      exportDate: new Date().toISOString(),
      user: userData,
      orders: userOrders,
      memberships: userMemberships,
      courseEnrollments: userEnrollments,
      donations: userDonations,
      eventRegistrations: userRegistrations,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="yeshe-norbu-data-export-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
