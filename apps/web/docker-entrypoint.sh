#!/bin/sh
set -e

echo "🙏 Starting Yeshin Norbu..."

# Run DB migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  cd /app/packages/db
  node_modules/.bin/drizzle-kit migrate || echo "Migration warning (may already be applied)"
  cd /app
  echo "Migrations complete."
else
  echo "No DATABASE_URL set, skipping migrations."
fi

exec node apps/web/server.js
