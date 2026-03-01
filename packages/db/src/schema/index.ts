import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  decimal,
  uuid,
  pgEnum,
  jsonb,
  serial,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'editor',
  'event_manager',
  'finance',
  'support',
  'cashier',
  'teacher',
  'member',
  'customer',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'failed',
  'refunded',
  'partially_refunded',
  'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'stripe_card',
  'swish',
  'cash',
  'complimentary',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);

export const channelEnum = pgEnum('sales_channel', ['online', 'pos', 'admin_manual']);

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'expired',
  'cancelled',
  'paused',
]);

export const courseAccessEnum = pgEnum('course_access', ['free', 'paid', 'membership']);

export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'audio', 'text', 'pdf']);

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'audio', 'pdf', 'document']);

export const posSessionStatusEnum = pgEnum('pos_session_status', ['open', 'closed']);

// ─── Users & Auth ────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 320 }).notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    passwordHash: text('password_hash').notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    locale: varchar('locale', { length: 5 }).notNull().default('sv'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    consentMarketing: boolean('consent_marketing').notNull().default(false),
    consentMarketingAt: timestamp('consent_marketing_at', { withTimezone: true }),
    consentAnalytics: boolean('consent_analytics').notNull().default(false),
    consentAnalyticsAt: timestamp('consent_analytics_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
    stripeIdx: index('users_stripe_idx').on(t.stripeCustomerId),
  }),
);

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedBy: uuid('granted_by').references(() => users.id),
});

export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId),
  }),
);

export const totpCredentials = pgTable('totp_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Events & Ticketing ──────────────────────────────────────────────────────

export const eventCategories = pgTable('event_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nameSv: varchar('name_sv', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  nameSv: varchar('name_sv', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  bioSv: text('bio_sv'),
  bioEn: text('bio_en'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 300 }).notNull(),
    titleSv: varchar('title_sv', { length: 500 }).notNull(),
    titleEn: varchar('title_en', { length: 500 }).notNull(),
    descriptionSv: text('description_sv'),
    descriptionEn: text('description_en'),
    categoryId: uuid('category_id').references(() => eventCategories.id),
    teacherId: uuid('teacher_id').references(() => teachers.id),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    venue: varchar('venue', { length: 500 }),
    venueAddress: text('venue_address'),
    isOnline: boolean('is_online').notNull().default(false),
    streamingUrl: text('streaming_url'),
    featuredImageUrl: text('featured_image_url'),
    published: boolean('published').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('events_slug_idx').on(t.slug),
    startsAtIdx: index('events_starts_at_idx').on(t.startsAt),
  }),
);

export const ticketTypes = pgTable('ticket_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  nameSv: varchar('name_sv', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  priceSek: decimal('price_sek', { precision: 10, scale: 2 }).notNull(),
  capacity: integer('capacity'),
  soldCount: integer('sold_count').notNull().default(0),
  saleOpensAt: timestamp('sale_opens_at', { withTimezone: true }),
  saleClosesAt: timestamp('sale_closes_at', { withTimezone: true }),
});

export const discountCodes = pgTable('discount_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  eventId: uuid('event_id').references(() => events.id),
  discountPercent: integer('discount_percent'),
  discountAmountSek: decimal('discount_amount_sek', { precision: 10, scale: 2 }),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  ticketTypeId: uuid('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id),
  userId: uuid('user_id').references(() => users.id),
  orderId: uuid('order_id').references(() => orders.id),
  attendeeName: varchar('attendee_name', { length: 200 }).notNull(),
  attendeeEmail: varchar('attendee_email', { length: 320 }).notNull(),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  qrCode: varchar('qr_code', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Orders & Payments ───────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: serial('order_number'),
    userId: uuid('user_id').references(() => users.id),
    channel: channelEnum('channel').notNull().default('online'),
    status: orderStatusEnum('status').notNull().default('pending'),
    totalSek: decimal('total_sek', { precision: 10, scale: 2 }).notNull(),
    discountSek: decimal('discount_sek', { precision: 10, scale: 2 }).notNull().default('0'),
    netSek: decimal('net_sek', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('SEK'),
    discountCodeId: uuid('discount_code_id').references(() => discountCodes.id),
    staffUserId: uuid('staff_user_id').references(() => users.id),
    ipAddress: varchar('ip_address', { length: 45 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('orders_user_idx').on(t.userId),
    createdIdx: index('orders_created_idx').on(t.createdAt),
  }),
);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPriceSek: decimal('unit_price_sek', { precision: 10, scale: 2 }).notNull(),
  totalPriceSek: decimal('total_price_sek', { precision: 10, scale: 2 }).notNull(),
  /** Reference to the source entity: event_registration, course_enrollment, membership, donation */
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
});

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    method: paymentMethodEnum('method').notNull(),
    status: paymentStatusEnum('status').notNull().default('pending'),
    amountSek: decimal('amount_sek', { precision: 10, scale: 2 }).notNull(),
    gatewayReference: varchar('gateway_reference', { length: 255 }),
    gatewayResponse: jsonb('gateway_response'),
    refundAmountSek: decimal('refund_amount_sek', { precision: 10, scale: 2 }),
    refundReason: text('refund_reason'),
    refundedBy: uuid('refunded_by').references(() => users.id),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index('payments_order_idx').on(t.orderId),
    gatewayRefIdx: index('payments_gateway_ref_idx').on(t.gatewayReference),
  }),
);

// ─── Audit Log (IMMUTABLE) ──────────────────────────────────────────────────

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
    /** Action performed: order.created, payment.succeeded, refund.processed, etc. */
    action: varchar('action', { length: 100 }).notNull(),
    channel: channelEnum('channel'),
    userId: uuid('user_id').references(() => users.id),
    staffUserId: uuid('staff_user_id').references(() => users.id),
    orderId: uuid('order_id').references(() => orders.id),
    paymentId: uuid('payment_id').references(() => payments.id),
    method: paymentMethodEnum('method'),
    amountSek: decimal('amount_sek', { precision: 10, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('SEK'),
    ipAddress: varchar('ip_address', { length: 45 }),
    metadata: jsonb('metadata'),
    description: text('description'),
  },
  (t) => ({
    timestampIdx: index('audit_log_timestamp_idx').on(t.timestamp),
    orderIdx: index('audit_log_order_idx').on(t.orderId),
    actionIdx: index('audit_log_action_idx').on(t.action),
  }),
);

// ─── Memberships ─────────────────────────────────────────────────────────────

export const membershipPlans = pgTable('membership_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nameSv: varchar('name_sv', { length: 200 }).notNull(),
  nameEn: varchar('name_en', { length: 200 }).notNull(),
  descriptionSv: text('description_sv'),
  descriptionEn: text('description_en'),
  priceSek: decimal('price_sek', { precision: 10, scale: 2 }).notNull(),
  intervalMonths: integer('interval_months').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  features: jsonb('features').$type<string[]>(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    planId: uuid('plan_id')
      .notNull()
      .references(() => membershipPlans.id),
    status: membershipStatusEnum('status').notNull().default('active'),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index('memberships_user_idx').on(t.userId),
    statusIdx: index('memberships_status_idx').on(t.status),
  }),
);

// ─── Donations ───────────────────────────────────────────────────────────────

export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  orderId: uuid('order_id').references(() => orders.id),
  amountSek: decimal('amount_sek', { precision: 10, scale: 2 }).notNull(),
  isRecurring: boolean('is_recurring').notNull().default(false),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  dedication: text('dedication'),
  anonymous: boolean('anonymous').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Courses / LMS ───────────────────────────────────────────────────────────

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 300 }).notNull().unique(),
  titleSv: varchar('title_sv', { length: 500 }).notNull(),
  titleEn: varchar('title_en', { length: 500 }).notNull(),
  descriptionSv: text('description_sv'),
  descriptionEn: text('description_en'),
  featuredImageUrl: text('featured_image_url'),
  teacherId: uuid('teacher_id').references(() => teachers.id),
  access: courseAccessEnum('access').notNull().default('free'),
  priceSek: decimal('price_sek', { precision: 10, scale: 2 }),
  membershipPlanId: uuid('membership_plan_id').references(() => membershipPlans.id),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const courseModules = pgTable('course_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  titleSv: varchar('title_sv', { length: 500 }).notNull(),
  titleEn: varchar('title_en', { length: 500 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const courseLessons = pgTable('course_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id')
    .notNull()
    .references(() => courseModules.id, { onDelete: 'cascade' }),
  titleSv: varchar('title_sv', { length: 500 }).notNull(),
  titleEn: varchar('title_en', { length: 500 }).notNull(),
  type: lessonTypeEnum('type').notNull(),
  contentSv: text('content_sv'),
  contentEn: text('content_en'),
  mediaUrl: text('media_url'),
  durationMinutes: integer('duration_minutes'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const courseEnrollments = pgTable(
  'course_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id')
      .notNull()
      .references(() => courses.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    orderId: uuid('order_id').references(() => orders.id),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCourseIdx: uniqueIndex('enrollments_user_course_idx').on(t.userId, t.courseId),
  }),
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => courseEnrollments.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => courseLessons.id),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    enrollmentLessonIdx: uniqueIndex('progress_enrollment_lesson_idx').on(
      t.enrollmentId,
      t.lessonId,
    ),
  }),
);

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id')
    .notNull()
    .references(() => courseEnrollments.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id),
  certificateNumber: varchar('certificate_number', { length: 50 }).notNull().unique(),
  pdfUrl: text('pdf_url'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Content ─────────────────────────────────────────────────────────────────

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 300 }).notNull().unique(),
  titleSv: varchar('title_sv', { length: 500 }).notNull(),
  titleEn: varchar('title_en', { length: 500 }).notNull(),
  contentSv: text('content_sv'),
  contentEn: text('content_en'),
  metaDescriptionSv: varchar('meta_description_sv', { length: 300 }),
  metaDescriptionEn: varchar('meta_description_en', { length: 300 }),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 300 }).notNull(),
    titleSv: varchar('title_sv', { length: 500 }).notNull(),
    titleEn: varchar('title_en', { length: 500 }).notNull(),
    excerptSv: text('excerpt_sv'),
    excerptEn: text('excerpt_en'),
    contentSv: text('content_sv'),
    contentEn: text('content_en'),
    featuredImageUrl: text('featured_image_url'),
    authorId: uuid('author_id').references(() => users.id),
    published: boolean('published').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('posts_slug_idx').on(t.slug),
    publishedIdx: index('posts_published_idx').on(t.publishedAt),
  }),
);

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  altTextSv: varchar('alt_text_sv', { length: 500 }),
  altTextEn: varchar('alt_text_en', { length: 500 }),
  sizeBytes: integer('size_bytes'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── POS ─────────────────────────────────────────────────────────────────────

export const posSessions = pgTable('pos_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffUserId: uuid('staff_user_id')
    .notNull()
    .references(() => users.id),
  status: posSessionStatusEnum('status').notNull().default('open'),
  openingFloat: decimal('opening_float', { precision: 10, scale: 2 }).notNull().default('0'),
  closingCash: decimal('closing_cash', { precision: 10, scale: 2 }),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  notes: text('notes'),
});

export const posTransactions = pgTable('pos_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => posSessions.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  method: paymentMethodEnum('method').notNull(),
  amountSek: decimal('amount_sek', { precision: 10, scale: 2 }).notNull(),
  cashReceived: decimal('cash_received', { precision: 10, scale: 2 }),
  changeGiven: decimal('change_given', { precision: 10, scale: 2 }),
  compReason: text('comp_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  sessions: many(userSessions),
  orders: many(orders),
  memberships: many(memberships),
  enrollments: many(courseEnrollments),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  category: one(eventCategories, {
    fields: [events.categoryId],
    references: [eventCategories.id],
  }),
  teacher: one(teachers, {
    fields: [events.teacherId],
    references: [teachers.id],
  }),
  ticketTypes: many(ticketTypes),
  registrations: many(eventRegistrations),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, { fields: [courses.teacherId], references: [teachers.id] }),
  modules: many(courseModules),
  enrollments: many(courseEnrollments),
}));

export const courseModulesRelations = relations(courseModules, ({ many }) => ({
  lessons: many(courseLessons),
}));

// ─── Event Category Assignments (junction) ───────────────────────────────────

export const eventCategoryAssignments = pgTable(
  'event_category_assignments',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => eventCategories.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: { name: 'eca_pk', columns: [t.eventId, t.categoryId] },
    eventIdx: index('eca_event_idx').on(t.eventId),
    categoryIdx: index('eca_category_idx').on(t.categoryId),
  }),
);

export const eventCategoryAssignmentsRelations = relations(eventCategoryAssignments, ({ one }) => ({
  event: one(events, { fields: [eventCategoryAssignments.eventId], references: [events.id] }),
  category: one(eventCategories, { fields: [eventCategoryAssignments.categoryId], references: [eventCategories.id] }),
}));
