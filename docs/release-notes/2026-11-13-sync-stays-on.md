---
date: 2026-11-13
branch: fix/sync-persists
base: dev
scenario-impact: needs_automation
---

# Wallet sync stays on until you stop it

Turning on sync on the Activity page is now remembered per wallet in this browser. Disconnecting, signing out, an ended session or switching to another wallet no longer turns it off. Connecting the same wallet again picks up the synced history straight away. Only "Stop syncing" turns it off, and only for that wallet.

## Changes

- `use-synced-address.ts` keeps a list of synced wallets under `monad-studio:synced-wallets` and reports sync as on only for the connected wallet.
- The session guard, RainbowKit sign-out and a 401 from the history API no longer clear the sync choice.
- "Stop syncing" removes only the connected wallet.
- A second wallet in the same browser is offered sync on its own; it never inherits the first wallet's choice, so its runs are not uploaded unless it opts in.

## Removed

- The single-wallet `monad-studio:synced-wallet` flag. Browsers that had it set ask once more.
- The "The connected wallet is not the one you synced with." line.

## Verification

- New tests: disconnect keeps the choice, the same wallet reconnecting stays synced, an ended session keeps the choice, another wallet is offered sync and fetches nothing.
- The session-guard test failed before the fix (flag cleared on disconnect) and passes after.
- `pnpm preflight`.
