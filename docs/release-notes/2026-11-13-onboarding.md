---
date: 2026-11-13
branch: feat/onboarding
base: dev
scenario-impact: needs_automation
---

# Connect on the way in, a welcome on each screen, centred empty states

"Open the studio" on the home page now opens the wallet modal. Connect and you land on the workspace; already connected and you go straight there; close the modal and you stay on the home page. The first time you open the workspace, Activity, MonGuard or GasLens, a short window explains what the screen does. Empty states are centred, without the icon.

## Changes

- `hooks/use-intercepted-click.ts`, `components/layout/studio-entry-gate.tsx`: catch clicks on links marked `data-studio-entry` and load the wallet gate on demand.
- `features/wallet`: `StudioGate` and `useStudioGate` open the RainbowKit modal and route to `/studio` once connected.
- `hooks/use-first-visit.ts`, `components/ui/intro-dialog.tsx`: one introduction per screen per browser, content in each feature's `copy.ts`.
- `components/ui/empty-state.tsx`: centred title, text and action; used by Activity (empty and filtered), MonGuard and GasLens.
- Landing fact line updated to mention connecting a wallet.
- ADR pair `ADR-2026-11-13-connect-before-studio` (Proposed) records the change to the wallet decision.

## Removed

- The left aligned empty state cards and the history icon on the Activity empty state.

## Verification

- Tests: click interception (marked links only, modified clicks pass through), first-visit dialog on each of the four screens, all existing tests with the introductions marked as seen.
- Chrome with a mock wallet: landing loads no RainbowKit script; click opens the modal; Escape keeps the landing page; connecting lands on the workspace with its welcome; reload does not show it again; Activity and MonGuard welcomes and centred empty states; an already connected wallet goes straight to the studio.
