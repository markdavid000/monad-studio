---
date: 2026-11-13
branch: feat/wallet-sync
base: dev
scenario-impact: needs_automation
---

# Activity follows your wallet to any device

The Activity page can now sync with your wallet. Sign one free message (no transaction, no gas) and your scans and reviews are also kept on the MonadStudio server under that wallet. Open Activity with the same wallet on another browser, sync there too, and the runs from your other devices appear, marked "From your synced history". Opening one downloads it into that browser and shows its results without an AI request.

## Changes

- Sign-In with Ethereum: `GET /api/auth/nonce`, `POST /api/auth/session` (verifies the message with `viem/siwe` for Monad testnet, this host and the nonce from a signed cookie), `GET` and `DELETE /api/auth/session`. The session is an HTTP-only cookie signed with HMAC SHA-256 and lasts 7 days.
- Synced history: `GET`, `POST` (up to 5 runs per request, validated with zod) and `DELETE /api/history`, `GET` and `DELETE /api/history/[id]`. Stored in Upstash per address, newest 200 kept, removed 180 days after the last write. One wallet can never read another's runs.
- Sync calls have their own rate limit (120 per 10 minutes per IP), separate from the AI limit.
- Activity page: wallet sync panel (no wallet, ready to sync, synced, synced with another wallet), runs from other devices in the list, delete and clear remove the synced copy too, stop syncing. Toasts for syncing, done, cancelled, failed and an expired session.
- MonGuard and GasLens push each new run when sync is on. If the push fails, the run is still saved in the browser and a warning says so.
- New environment variable `SESSION_SECRET` (at least 32 characters), documented in `.env.example`.

## Removed

- Nothing.

## Verification

- Server tests: a real SIWE signature from a test key; wrong chain, domain or nonce, missing nonce cookie, tampered cookie and a changed secret are rejected; history save, list, fetch, delete, clear, limits, the 200 cap and isolation between wallets against an in-memory Redis.
- Browser tests: sync start, cancelled signature, runs from other devices, opening a remote run, delete and clear on both sides, expired session, stop syncing, and a tool pushing a new run.
- End to end on port 3000 with the real server and Upstash, two browser profiles and one test wallet: run a scan on A, sync A, sync B, see and open A's run on B, clear on B (server copy gone, A's local copy kept), stop syncing on A.
