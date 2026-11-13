# Plan: contract journey between tools

ADR: [ADR-2026-11-13-contract-journey](../adr/ADR-2026-11-13-contract-journey.md) (Accepted).

## Files

- Shared: `components/ui/next-step-bar.tsx`; `ResultsSheet` gains a `footer` slot; `hooks/use-send-contract.ts` (load the draft, go to `/studio/<tool>?run=new`); `hooks/use-accept-contract.ts` (replace the draft, Undo toast for 10 s; toasts gain a `duration` option); `hooks/use-auto-run.ts` (start a run once on `?run=new`, then drop the parameter); `journeyCopy` in `lib/copy.ts`. `diff.ts` moves from `features/gaslens/lib` to `lib/`.
- MonGuard: `fixInputSchema`, `fixReplySchema`, `toFixResult`, `monguardRunSchema` (a saved run is a scan report or `{ kind: "fix", scan, fix }`); `server/fix.ts`; `app/api/monguard/fix`; `useFix`; checkboxes on findings with a fix; `FixDiff` and `FixPanel` replace the code and findings while reviewing fixes; `NextStep` bar.
- GasLens: `NextStep` bar with Accept rewrite (only when the check is clear), Scan in MonGuard, Compile in MonadForge.
- MonadForge: `WrittenNextStep` (Use in workspace, Scan, Review gas, Compile) and `CompiledNextStep` (Scan, Review gas).
- MonadForge compile errors (amendment): `server/fix-errors.ts`, `app/api/forge/fix`, `useFixErrors`, `ErrorFixPanel`; `DiffCode` in `components/ui` shared with MonGuard's `FixDiff`.
- Tool pages read `run=new` as `autoRun`.

## State

- MonGuard: excluded finding ids (all fixes chosen by default), whether the findings or the fixes are showing. The fix result belongs to the scan it was asked for; a new scan drops it. A fix run is the tool's last run, so it survives navigation like a scan.
- Accepted is derived: the draft equals the fixed source or the rewrite. A result is not stale when the draft equals its accepted version.
- Sending sends the accepted version when there is one, otherwise the contract the tool looked at, with its file name.

## Tests

Route: fix applied, unchanged reply, limits on input, 429, 502. Components: choosing fixes, the fix request, the diff, accept and Undo, sends navigate with `?run=new`, auto run on arrival, GasLens accept only when the check is clear, MonadForge compile from the written contract and sends.
