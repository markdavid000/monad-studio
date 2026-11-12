# ADR-2026-11-12: Activity history without sign-up

- **Status:** Proposed
- **Approved by:** (name, date; filled in by the maintainer)
- **Companion:** [ADR-2026-11-12-activity-history-for-dummies.md](ADR-2026-11-12-activity-history-for-dummies.md)

## Context

The studio needs no account. The workspace contract lives in `localStorage` (`monad-studio:draft`), and MonGuard and GasLens results live only in TanStack Query mutation state, so a reload loses them. A user cannot see what they scanned, reviewed or (later) deployed, or reopen a past result without paying for another AI call.

The owner wants activity tracking as a core feature, but without forcing sign-up. The only identity a Web3 user already has is their wallet, and the studio already connects one through RainbowKit (ADR-2026-11-11-wallet-connection). Upstash Redis is already provisioned for rate limiting (ADR-2026-11-11-ai-analysis-on-the-server).

A history entry is small apart from the source: tool, time, contract name, a SHA-256 of the source, the source itself (up to 60 KB) and the mapped report (a few KB).

## Options considered

### A. Browser-only history

Every run is saved in IndexedDB in the browser. No account, nothing leaves the device, works offline, free. Lost when site data is cleared, and not shared between devices or browsers.

### B. Wallet-linked history on the server

The user signs a Sign-In with Ethereum message (EIP-4361; a signature, not a transaction, so no gas). The server verifies it with `viem/siwe`, sets an HTTP-only session cookie signed with a server secret, and stores history in Upstash under the wallet address. Works on any device with the same wallet. Costs: a sign-in step, a session secret, Redis storage, and contract sources held on our server, which needs a privacy note and a delete button.

### C. Email or social accounts

Familiar, but adds an auth provider, password resets and personal data for an audience that already has wallets. Contradicts "no sign-up".

## Decision

A first, then B on top. Nobody has to sign up.

1. **Local history for everyone.** Each MonGuard scan and GasLens review (and later forge compiles and deploys) is written to IndexedDB. A new Activity page in the studio sidebar lists runs newest first, filters by tool, and reopens a run: the source goes back into the workspace and the saved report shows without a new AI call. Users can delete one entry or clear everything. Kept to the last 200 runs.
2. **Wallet sync, opt in.** With a wallet connected, the Activity page offers "Sync with your wallet". One signature starts a 7-day session; local entries upload and later runs save to both. Server copies are capped at 200 per address and expire after 180 days. "Delete synced history" removes them from the server.

Deploys from step 5 onward are on-chain anyway; the Activity page links them to the explorer.

## Diagram

```
tool run ──► history store (IndexedDB) ──► Activity page
                     │  wallet connected and signed in
                     ▼
        POST /api/history ──► session cookie check ──► Upstash: history:<address>
        GET  /api/history ◄────────────────────────────┘
```

## Consequences

- Users can see and reopen their work, and reopening does not spend the AI limit.
- Without sync, history is per browser; the page says so plainly.
- With sync, we hold contract sources on our server tied to an address. The page explains this before the user signs, and they can delete it.
- New env var `SESSION_SECRET`. New routes `/api/auth/siwe` (nonce, verify, sign out) and `/api/history`, both rate limited.
- No new packages: IndexedDB through a small wrapper, SIWE through `viem/siwe`, cookie signing through Node `crypto`.
- Built in two PRs: local history first, wallet sync second.

## Verification

- Unit tests for the history store (save, list, cap, delete, reopen), the session cookie (valid, expired, tampered) and SIWE verification (wrong nonce, wrong address, wrong chain).
- Route tests: no session returns 401; one address cannot read another's history.
- Manual: run a scan, reload, reopen it from Activity; sign in with MetaMask on Monad testnet, open the studio in another browser, see the same history.
