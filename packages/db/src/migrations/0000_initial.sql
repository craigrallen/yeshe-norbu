-- Yeshe Norbu — Initial Migration
-- Generated from Drizzle schema

-- Enums
CREATE TYPE "user_role" AS ENUM ('admin', 'editor', 'finance', 'support', 'cashier', 'teacher', 'member', 'customer');
CREATE TYPE "order_status" AS ENUM ('pending', 'confirmed', 'failed', 'refunded', 'partially_refunded', 'cancelled');
CREATE TYPE "payment_method" AS ENUM ('stripe_card', 'swish', 'cash', 'complimentary');
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE "sales_channel" AS ENUM ('online', 'pos', 'admin_manual');
CREATE TYPE "membership_status" AS ENUM ('active', 'expired', 'cancelled', 'paused');
CREATE TYPE "course_access" AS ENUM ('free', 'paid', 'membership');
CREATE TYPE "lesson_type" AS ENUM ('video', 'audio', 'text', 'pdf');
CREATE TYPE "media_type" AS ENUM ('image', 'video', 'audio', 'pdf', 'document');
CREATE TYPE "pos_session_status" AS ENUM ('open', 'closed');

-- Users & Auth
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "password_hash" TEXT NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20),
  "locale" VARCHAR(5) NOT NULL DEFAULT 'sv',
  "stripe_customer_id" VARCHAR(255),
  "consent_marketing" BOOLEAN NOT NULL DEFAULT false,
  "consent_marketing_at" TIMESTAMPTZ,
  "consent_analytics" BOOLEAN NOT NULL DEFAULT false,
  "consent_analytics_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");
CREATE INDEX "users_stripe_idx" ON "users" ("stripe_customer_id");

CREATE TABLE "user_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" "user_role" NOT NULL,
  "granted_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "granted_by" UUID REFERENCES "users"("id")
);

CREATE TABLE "user_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refresh_token_hash" TEXT NOT NULL,
  "user_agent" TEXT,
  "ip_address" VARCHAR(45),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "sessions_user_idx" ON "user_sessions" ("user_id");

CREATE TABLE "totp_credentials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "secret" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events & Ticketing
CREATE TABLE "event_categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "name_sv" VARCHAR(200) NOT NULL,
  "name_en" VARCHAR(200) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "teachers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "name_sv" VARCHAR(200) NOT NULL,
  "name_en" VARCHAR(200) NOT NULL,
  "bio_sv" TEXT,
  "bio_en" TEXT,
  "photo_url" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(300) NOT NULL,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "description_sv" TEXT,
  "description_en" TEXT,
  "category_id" UUID REFERENCES "event_categories"("id"),
  "teacher_id" UUID REFERENCES "teachers"("id"),
  "starts_at" TIMESTAMPTZ NOT NULL,
  "ends_at" TIMESTAMPTZ,
  "venue" VARCHAR(500),
  "venue_address" TEXT,
  "is_online" BOOLEAN NOT NULL DEFAULT false,
  "streaming_url" TEXT,
  "featured_image_url" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX "events_slug_idx" ON "events" ("slug");
CREATE INDEX "events_starts_at_idx" ON "events" ("starts_at");

CREATE TABLE "ticket_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "name_sv" VARCHAR(200) NOT NULL,
  "name_en" VARCHAR(200) NOT NULL,
  "price_sek" DECIMAL(10,2) NOT NULL,
  "capacity" INTEGER,
  "sold_count" INTEGER NOT NULL DEFAULT 0,
  "sale_opens_at" TIMESTAMPTZ,
  "sale_closes_at" TIMESTAMPTZ
);

CREATE TABLE "discount_codes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(50) NOT NULL UNIQUE,
  "event_id" UUID REFERENCES "events"("id"),
  "discount_percent" INTEGER,
  "discount_amount_sek" DECIMAL(10,2),
  "max_uses" INTEGER,
  "used_count" INTEGER NOT NULL DEFAULT 0,
  "valid_from" TIMESTAMPTZ,
  "valid_until" TIMESTAMPTZ,
  "active" BOOLEAN NOT NULL DEFAULT true
);

-- Orders & Payments
CREATE TABLE "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number" SERIAL,
  "user_id" UUID REFERENCES "users"("id"),
  "channel" "sales_channel" NOT NULL DEFAULT 'online',
  "status" "order_status" NOT NULL DEFAULT 'pending',
  "total_sek" DECIMAL(10,2) NOT NULL,
  "discount_sek" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "net_sek" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'SEK',
  "discount_code_id" UUID REFERENCES "discount_codes"("id"),
  "staff_user_id" UUID REFERENCES "users"("id"),
  "ip_address" VARCHAR(45),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "orders_user_idx" ON "orders" ("user_id");
CREATE INDEX "orders_created_idx" ON "orders" ("created_at");

CREATE TABLE "event_registrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES "events"("id"),
  "ticket_type_id" UUID NOT NULL REFERENCES "ticket_types"("id"),
  "user_id" UUID REFERENCES "users"("id"),
  "order_id" UUID REFERENCES "orders"("id"),
  "attendee_name" VARCHAR(200) NOT NULL,
  "attendee_email" VARCHAR(320) NOT NULL,
  "checked_in_at" TIMESTAMPTZ,
  "qr_code" VARCHAR(100) NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "description" VARCHAR(500) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit_price_sek" DECIMAL(10,2) NOT NULL,
  "total_price_sek" DECIMAL(10,2) NOT NULL,
  "reference_type" VARCHAR(50),
  "reference_id" UUID
);

CREATE TABLE "payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id"),
  "method" "payment_method" NOT NULL,
  "status" "payment_status" NOT NULL DEFAULT 'pending',
  "amount_sek" DECIMAL(10,2) NOT NULL,
  "gateway_reference" VARCHAR(255),
  "gateway_response" JSONB,
  "refund_amount_sek" DECIMAL(10,2),
  "refund_reason" TEXT,
  "refunded_by" UUID REFERENCES "users"("id"),
  "refunded_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "payments_order_idx" ON "payments" ("order_id");
CREATE INDEX "payments_gateway_ref_idx" ON "payments" ("gateway_reference");

-- Audit Log (IMMUTABLE)
CREATE TABLE "audit_log" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "action" VARCHAR(100) NOT NULL,
  "channel" "sales_channel",
  "user_id" UUID REFERENCES "users"("id"),
  "staff_user_id" UUID REFERENCES "users"("id"),
  "order_id" UUID REFERENCES "orders"("id"),
  "payment_id" UUID REFERENCES "payments"("id"),
  "method" "payment_method",
  "amount_sek" DECIMAL(10,2),
  "currency" VARCHAR(3) DEFAULT 'SEK',
  "ip_address" VARCHAR(45),
  "metadata" JSONB,
  "description" TEXT
);
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log" ("timestamp");
CREATE INDEX "audit_log_order_idx" ON "audit_log" ("order_id");
CREATE INDEX "audit_log_action_idx" ON "audit_log" ("action");

-- Prevent UPDATE and DELETE on audit_log
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is immutable: % operations are not allowed', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON "audit_log"
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- Memberships
CREATE TABLE "membership_plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(100) NOT NULL UNIQUE,
  "name_sv" VARCHAR(200) NOT NULL,
  "name_en" VARCHAR(200) NOT NULL,
  "description_sv" TEXT,
  "description_en" TEXT,
  "price_sek" DECIMAL(10,2) NOT NULL,
  "interval_months" INTEGER NOT NULL,
  "stripe_price_id" VARCHAR(255),
  "features" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "memberships" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "plan_id" UUID NOT NULL REFERENCES "membership_plans"("id"),
  "status" "membership_status" NOT NULL DEFAULT 'active',
  "stripe_subscription_id" VARCHAR(255),
  "current_period_start" TIMESTAMPTZ NOT NULL,
  "current_period_end" TIMESTAMPTZ NOT NULL,
  "cancelled_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "memberships_user_idx" ON "memberships" ("user_id");
CREATE INDEX "memberships_status_idx" ON "memberships" ("status");

-- Donations
CREATE TABLE "donations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "order_id" UUID REFERENCES "orders"("id"),
  "amount_sek" DECIMAL(10,2) NOT NULL,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "stripe_subscription_id" VARCHAR(255),
  "dedication" TEXT,
  "anonymous" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses / LMS
CREATE TABLE "courses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(300) NOT NULL UNIQUE,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "description_sv" TEXT,
  "description_en" TEXT,
  "featured_image_url" TEXT,
  "teacher_id" UUID REFERENCES "teachers"("id"),
  "access" "course_access" NOT NULL DEFAULT 'free',
  "price_sek" DECIMAL(10,2),
  "membership_plan_id" UUID REFERENCES "membership_plans"("id"),
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "course_modules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "course_lessons" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "module_id" UUID NOT NULL REFERENCES "course_modules"("id") ON DELETE CASCADE,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "type" "lesson_type" NOT NULL,
  "content_sv" TEXT,
  "content_en" TEXT,
  "media_url" TEXT,
  "duration_minutes" INTEGER,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "course_enrollments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" UUID NOT NULL REFERENCES "courses"("id"),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "order_id" UUID REFERENCES "orders"("id"),
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX "enrollments_user_course_idx" ON "course_enrollments" ("user_id", "course_id");

CREATE TABLE "lesson_progress" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "enrollment_id" UUID NOT NULL REFERENCES "course_enrollments"("id") ON DELETE CASCADE,
  "lesson_id" UUID NOT NULL REFERENCES "course_lessons"("id"),
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX "progress_enrollment_lesson_idx" ON "lesson_progress" ("enrollment_id", "lesson_id");

CREATE TABLE "certificates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "enrollment_id" UUID NOT NULL REFERENCES "course_enrollments"("id"),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "course_id" UUID NOT NULL REFERENCES "courses"("id"),
  "certificate_number" VARCHAR(50) NOT NULL UNIQUE,
  "pdf_url" TEXT,
  "issued_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content
CREATE TABLE "pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(300) NOT NULL UNIQUE,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "content_sv" TEXT,
  "content_en" TEXT,
  "meta_description_sv" VARCHAR(300),
  "meta_description_en" VARCHAR(300),
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(300) NOT NULL,
  "title_sv" VARCHAR(500) NOT NULL,
  "title_en" VARCHAR(500) NOT NULL,
  "excerpt_sv" TEXT,
  "excerpt_en" TEXT,
  "content_sv" TEXT,
  "content_en" TEXT,
  "featured_image_url" TEXT,
  "author_id" UUID REFERENCES "users"("id"),
  "published" BOOLEAN NOT NULL DEFAULT false,
  "published_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" ("slug");
CREATE INDEX "posts_published_idx" ON "posts" ("published_at");

CREATE TABLE "media" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "filename" VARCHAR(500) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "type" "media_type" NOT NULL,
  "url" TEXT NOT NULL,
  "alt_text_sv" VARCHAR(500),
  "alt_text_en" VARCHAR(500),
  "size_bytes" INTEGER,
  "uploaded_by" UUID REFERENCES "users"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- POS
CREATE TABLE "pos_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "staff_user_id" UUID NOT NULL REFERENCES "users"("id"),
  "status" "pos_session_status" NOT NULL DEFAULT 'open',
  "opening_float" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "closing_cash" DECIMAL(10,2),
  "opened_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "closed_at" TIMESTAMPTZ,
  "notes" TEXT
);

CREATE TABLE "pos_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL REFERENCES "pos_sessions"("id"),
  "order_id" UUID NOT NULL REFERENCES "orders"("id"),
  "method" "payment_method" NOT NULL,
  "amount_sek" DECIMAL(10,2) NOT NULL,
  "cash_received" DECIMAL(10,2),
  "change_given" DECIMAL(10,2),
  "comp_reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
