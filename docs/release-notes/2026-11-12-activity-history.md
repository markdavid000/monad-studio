---
date: 2026-11-12
branch: feat/activity-history
base: dev
scenario-impact: needs_automation
---

# Activity: every scan and review is saved in your browser

A new Activity page in the studio sidebar lists every MonGuard scan and GasLens review run in this browser, newest first. Open one and its contract goes back into the workspace and its results open again, without using an AI request. Runs can be filtered by tool, deleted one by one, or cleared together. Nothing is sent to a server; wallet sync comes in a later update.

## Changes

- `lib/history.ts`: IndexedDB store, newest 200 runs kept.
- `hooks/use-history.ts`: query and mutation hooks, `useRecordRun` and `useSavedRun`.
- MonGuard and GasLens save each successful run with a one line summary, and reopen a saved run from `?run=<id>`. A missing run says so on the page.
- `features/activity` and `/studio/activity`: filter, open, delete, clear with confirmation, and empty, loading and unavailable states. The info icon says where activity is kept.
- Sidebar link, smoke test route, architecture doc.

## Removed

- Nothing.

## Verification

- Tests: the store against `fake-indexeddb`, the Activity page, saving and reopening in both tools.
- Chrome with mocked AI replies and real IndexedDB: ran a scan and a review, reloaded, opened the scan from Activity (no new AI request), deleted one run, cleared the rest after confirming.
