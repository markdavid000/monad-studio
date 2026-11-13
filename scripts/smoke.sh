#!/usr/bin/env bash
set -euo pipefail

PORT="${SMOKE_PORT:-3099}"
PUBLIC_ROUTES=("/" "/robots.txt" "/sitemap.xml" "/demo" "/demo/monguard" "/demo/gaslens")
STUDIO_ROUTES=("/studio" "/studio/monguard" "/studio/gaslens" "/studio/forge" "/studio/activity")
API_ROUTES=("/api/history")
LOG="$(mktemp)"

export SESSION_SECRET="${SESSION_SECRET:-$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')}"
SESSION="$(node -e '
const { createHmac } = require("crypto");
const value = `0x70997970C51812dc3A010C7d01b50e0d17dc79C8|${Math.floor(Date.now() / 1000) + 600}`;
const sig = createHmac("sha256", process.env.SESSION_SECRET).update(value).digest("base64url");
console.log(encodeURIComponent(`${value}.${sig}`));
')"

pnpm exec next start --port "$PORT" >"$LOG" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true; rm -f "$LOG"' EXIT

for _ in $(seq 1 60); do
  if curl -s -o /dev/null "http://localhost:$PORT/robots.txt"; then break; fi
  sleep 1
done

FAILED=0
expect() {
  local want="$1" route="$2" label="$3"
  shift 3
  local status
  status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$@" "http://localhost:$PORT$route")"
  echo "$status $route ($label)"
  [ "$status" = "$want" ] || FAILED=1
}

for route in "${PUBLIC_ROUTES[@]}"; do
  expect 200 "$route" "public"
done
for route in "${STUDIO_ROUTES[@]}"; do
  expect 307 "$route" "no session, redirected to connect"
  expect 200 "$route" "signed in" -H "Cookie: ms_session=$SESSION"
done
for route in "${API_ROUTES[@]}"; do
  expect 401 "$route" "no session"
done

if [ "$FAILED" -ne 0 ]; then
  echo "Smoke test failed. Server log:"
  cat "$LOG"
  exit 1
fi
echo "Public and demo routes load, studio routes need a wallet session and load with one."
