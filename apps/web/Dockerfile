FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/payments/package.json ./packages/payments/
COPY packages/email/package.json ./packages/email/
COPY packages/ui/package.json ./packages/ui/
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @yeshe/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone output (includes server.js + node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./

# Static assets (JS chunks, CSS)
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Public folder (favicon, images, robots.txt etc)
COPY --from=builder /app/apps/web/public ./apps/web/public

# Full .next/server directory — needed for favicon.ico.json and other server metadata
COPY --from=builder /app/apps/web/.next/server ./apps/web/.next/server

# DB migrations
COPY --from=builder /app/packages/db/src/migrations ./packages/db/src/migrations
COPY --from=builder /app/packages/db/drizzle.config.ts ./packages/db/
COPY --from=builder /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=builder /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/docker-entrypoint.sh"]
