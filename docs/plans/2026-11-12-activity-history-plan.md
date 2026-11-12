# Plan: activity history, part 1 (browser)

Implements step 1 of [ADR-2026-11-12-activity-history](../adr/ADR-2026-11-12-activity-history.md). Wallet sync is part 2.

## Files

- `lib/history.ts`: IndexedDB store `monad-studio` / `runs`, keyed by id, indexed by `createdAt`. `saveRun`, `listRuns` (newest first), `getRun`, `deleteRun`, `clearRuns`. Keeps the newest 200.
- `hooks/use-history.ts`: TanStack Query wrappers. `useRecordRun(tool)` saves and warns with a toast on failure. `useSavedRun(tool, id, schema)` loads a run and validates its report with the tool's schema.
- `features/monguard`, `features/gaslens`: record each successful run with a one line summary; read `?run=<id>` from the page and show that report in the results layer without an AI call; say when the run is gone.
- `features/activity`: `/studio/activity` with filter by tool, open, delete one, clear all behind a confirm dialog, and empty, loading and unavailable states.
- Sidebar: Activity under Workspace. Smoke test covers the route.

## Interfaces

```ts
interface HistoryRun {
  id: string;
  tool: "monguard" | "gaslens";
  createdAt: number;
  fileName: string;
  contractName: string;
  summary: string;
  source: string;
  report: unknown;
}
```

`report` stays `unknown` in the shared layer so no feature imports another; each tool parses it back.

## Tests

- Store against `fake-indexeddb` (dev dependency): save and read, order, cap, delete and clear.
- Activity page: empty, about text, order and filter, open (draft plus route), delete, clear with confirm.
- Each tool: saves a finished run, reopens a saved run without fetch, missing run message.

## Removed

Nothing. This adds history alongside the existing flow.
