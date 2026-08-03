#!/bin/sh
set -e

echo "cwms_backend: waiting for database and applying migrations..."
npx prisma migrate deploy

if [ "${CWMS_SEED:-true}" = "true" ]; then
  echo "cwms_backend: seeding demo data (upsert)..."
  if [ -f prisma/seed.js ]; then
    node prisma/seed.js
  else
    npx prisma db seed
  fi
fi

echo "cwms_backend: starting API..."
# Nest outDir includes src/ when prisma/*.ts is part of the TS project
if [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
fi
exec node dist/main.js
