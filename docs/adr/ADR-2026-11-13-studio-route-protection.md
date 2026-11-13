# ADR-2026-11-13: Protect every studio route with a signed wallet session

- **Status:** Proposed
- **Approved by:** (name, date; filled in by the maintainer)
- **Companion:** [ADR-2026-11-13-studio-route-protection-for-dummies.md](ADR-2026-11-13-studio-route-protection-for-dummies.md)
- **Supersedes in part:** [ADR-2026-11-13-connect-before-studio](ADR-2026-11-13-connect-before-studio.md) ("direct links to the studio still work without a wallet") and [ADR-2026-11-12-activity-history](ADR-2026-11-12-activity-history.md) (the separate signature to turn on sync).

## Context

The owner wants strict route protection: nobody reaches the studio without a connected wallet. "Connected" in the browser is only a claim; any script can pretend to be a wallet. The server can only trust a signature it has verified.

## Options considered

### A. Client-side check of the wagmi connection

Easy, but anyone can open the HTML, call the APIs directly, or fake a provider. Not protection.

### B. Signed session checked on the server, plus a client guard

Entering the studio requires Sign-In with Ethereum, which RainbowKit shows as "Verify your account" right after connecting. The server sets the existing HMAC signed, HTTP-only session cookie. Every studio page and studio API checks it on the server; the client signs out the moment the wallet disconnects or changes.

## Decision

B, enforced in four places:

1. `src/proxy.ts` runs before `/studio/**`, `/api/monguard/**`, `/api/gaslens/**` and `/api/history/**`. No valid session: pages redirect to `/?connect=1&next=<path>`, APIs answer 401.
2. The studio layout verifies the cookie again on the server (`requireStudioSession`).
3. The AI routes and history routes verify it inside the handler, as Next.js recommends.
4. `SessionGuard` in the studio signs out and returns to the connect screen when the wallet disconnects, switches account or the server session ends. A wallet that never reconnects gets three seconds.

The landing page opens the wallet modal by itself on `?connect=1` and returns to `next` after signing in; `next` only accepts `/studio` paths. Wallet sync no longer asks for its own signature: it is a switch on top of the session. A missing `SESSION_SECRET` fails closed (500), never open.

## Diagram

```
request ─► proxy.ts ─┬─ valid ms_session ─► studio layout (checks again) ─► page ─► SessionGuard
                     ├─ page, no session ─► 307 /?connect=1&next=…  ─► wallet modal ─► SIWE ─► next
                     └─ API, no session ──► 401
```

## Consequences

- No part of the studio or its APIs works without a verified wallet, including direct links and scripts.
- One signature per browser every 7 days, shown by RainbowKit after connecting.
- Studio pages are rendered per request (they read the cookie) instead of prerendered.
- Disconnecting the wallet ends the session immediately.
- The smoke test checks 307 without a session, 200 with one and 401 on the APIs.
- No packages added.

## Verification

- Unit tests: proxy (matcher, redirect with `next`, 401, valid, forged and expired cookies), safe `next` paths, AI routes refusing callers without a session, the client guard (disconnect, other account, ended session, no wallet after the grace period).
- Smoke test on the production build.
- Chrome with a mock wallet signing with a real key: direct link redirect, automatic modal, verify step, landing on the requested tool, HttpOnly cookie, disconnect sends you back and clears the cookie.
