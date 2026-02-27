#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/db && node_modules/.bin/drizzle-kit migrate || echo "Migration skipped or failed"

echo "Starting Next.js server..."
cd /app/apps/web
exec node server.js
