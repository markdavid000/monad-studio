#!/usr/bin/env bash
set -euo pipefail

PORT="${SMOKE_PORT:-3099}"
ROUTES=("/" "/studio" "/studio/monguard" "/studio/gaslens" "/robots.txt" "/sitemap.xml")
LOG="$(mktemp)"

pnpm exec next start --port "$PORT" >"$LOG" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true; rm -f "$LOG"' EXIT

for _ in $(seq 1 60); do
  if curl -s -o /dev/null "http://localhost:$PORT/robots.txt"; then break; fi
  sleep 1
done

FAILED=0
for route in "${ROUTES[@]}"; do
  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "http://localhost:$PORT$route")"
  echo "$status $route"
  [ "$status" = "200" ] || FAILED=1
done

if [ "$FAILED" -ne 0 ]; then
  echo "Smoke test failed. Server log:"
  cat "$LOG"
  exit 1
fi
echo "The production build serves every route."
