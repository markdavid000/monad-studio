#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-full}"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

step() {
  echo -e "\n${BLUE}[$1] $2${NC}"
}

step "1/9" "Format"
pnpm format:check

step "2/9" "Lint"
pnpm lint

step "3/9" "Comments"
pnpm comments:check

step "4/9" "Copy"
pnpm copy:check

step "5/9" "Typecheck"
pnpm typecheck

step "6/9" "Unit tests"
pnpm test

step "7/9" "Unused files, exports and dependencies"
pnpm knip

if [ "$MODE" = "--fast" ]; then
  echo -e "\n${GREEN}Fast preflight passed. The build and smoke test run in CI and in a full preflight.${NC}"
  exit 0
fi

step "8/9" "Production build (clean)"
rm -rf .next
pnpm build

step "9/9" "Smoke test (production server)"
pnpm smoke

echo -e "\n${GREEN}All preflight gates passed.${NC}"
