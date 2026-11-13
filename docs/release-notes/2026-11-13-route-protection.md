---
date: 2026-11-13
branch: feat/route-guard
base: dev
scenario-impact: needs_automation
---

# The studio only opens for a verified wallet

Every studio page and every studio API now needs a wallet that has signed in. Connecting is followed by RainbowKit's "Verify your account" step: one free signature, valid for 7 days. Without it, studio links send you to the home page, where the wallet modal opens and then takes you to the page you asked for; the APIs answer 401. Disconnecting or switching wallets in the studio signs you out at once.

## Changes

- `src/proxy.ts`: session check before `/studio/**`, `/api/monguard/**`, `/api/gaslens/**`, `/api/history/**`; redirect with `?connect=1&next=` or 401.
- Studio layout checks the session on the server; AI routes refuse callers without one.
- RainbowKit authentication adapter (`use-wallet-session.ts`) on the existing SIWE routes; `SessionGuard` for disconnects, account changes and ended sessions.
- Landing opens the wallet modal on `?connect=1` and goes to a safe `next` path afterwards.
- Wallet sync on the Activity page no longer asks for its own signature.
- Smoke test: public routes 200, studio routes 307 without a session and 200 with one, studio API 401.
- ADR pair `ADR-2026-11-13-studio-route-protection` (Proposed).

## Removed

- The separate sync signature and its "cancelled" and "confirm in your wallet" states.
- Direct, wallet-free access to studio pages and AI routes.

## Verification

- Tests for the proxy, safe redirects, AI routes without a session, the client guard and the updated sync flow.
- `pnpm preflight` including the stricter smoke test.
- Chrome with a mock wallet that signs with a real key: direct link to GasLens redirects and opens the modal, verify step, land on GasLens, HttpOnly SameSite=Lax cookie, API 200 with it and 401 without, disconnect returns to connect and clears the cookie.
