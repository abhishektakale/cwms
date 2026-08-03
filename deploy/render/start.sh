#!/bin/sh
# Render Free (Node) start — from repo root:
#   sh deploy/render/start.sh
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/backend"
echo "cwms_render: migrate..."
npx prisma migrate deploy
if [ "${CWMS_SEED:-true}" != "false" ]; then
  echo "cwms_render: seed..."
  npx prisma db seed || true
fi
echo "cwms_render: start API..."
if [ -f dist/main.js ]; then
  exec node dist/main.js
fi
exec node dist/main
