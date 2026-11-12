## Summary

What this changes and why. Link the issue: Closes #

## Type

- [ ] feat
- [ ] fix
- [ ] perf
- [ ] refactor
- [ ] docs, build, ci or chore

## Decision and plan

- ADR pair: `docs/adr/...` (approved by: ) or **not required** because:
- Plan: `docs/plans/...` or **not required** because:

## Pre-review audit

- [ ] **Read first:** I read the code, callers, tests and docs for everything I changed.
- [ ] **Layers:** imports point down; features imported only through `index.ts` or `server.ts`; no cross-feature imports.
- [ ] **Server boundary:** inputs and upstream replies (Groq, RPC, Sourcify) validated with `zod` on the server; components never fetch or hold secrets.
- [ ] **Hooks:** the right hook for each job; stateful logic, effects and wallet calls in custom hooks.
- [ ] **States:** every async path has loading, empty and error states; nothing freezes.
- [ ] **Copy:** user-facing text lives in `copy.ts`; `pnpm copy:check` passes; every claim is true of the shipped code.
- [ ] **Tests:** behaviour tests for success, empty, loading and error states; bug fixes were red before green.
- [ ] **Amounts:** token amounts in base units with `bigint`.
- [ ] **Accessibility:** keyboard, labels, contrast, reduced motion; public routes still score 98 or more.
- [ ] **Comments:** none from an agent; `pnpm comments:check` passes.
- [ ] **Cleanup:** replaced code, assets, config and packages removed; `pnpm knip` is clean.
- [ ] **Dependencies:** any new package is used in this PR, pinned, and justified below.
- [ ] **Preflight:** `pnpm preflight` passed with zero warnings.
- [ ] **Release note:** `docs/release-notes/<date>-<topic>.md` with `scenario-impact` set.

## Removed

Code, files, config and packages this PR deletes.

## How this was verified

What you ran and what you clicked, in light and dark mode, on a phone-sized screen, with a wallet where the change needs one.

## Screenshots
