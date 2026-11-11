#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-full}"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

step() {
  echo -e "\n${BLUE}[$1] $2${NC}"
}

step "1/10" "Format"
pnpm format:check

step "2/10" "Lint"
pnpm lint

step "3/10" "Comments"
pnpm comments:check

step "4/10" "Copy"
pnpm copy:check

step "5/10" "Typecheck"
pnpm typecheck

step "6/10" "Unit tests"
pnpm test

step "7/10" "Unused files, exports and dependencies"
pnpm knip

if [ "$MODE" = "--fast" ]; then
  echo -e "\n${GREEN}Fast preflight passed. Build, smoke test and Lighthouse run in CI and in a full preflight.${NC}"
  exit 0
fi

step "8/10" "Production build (clean)"
rm -rf .next
pnpm build

step "9/10" "Smoke test (production server)"
pnpm smoke

step "10/10" "Lighthouse on public routes (mobile, every category 98 or more)"
pnpm lighthouse

echo -e "\n${GREEN}All preflight gates passed.${NC}"
