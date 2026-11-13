# Plan: no-wallet demo

ADR: [ADR-2026-11-13-no-wallet-demo](../adr/ADR-2026-11-13-no-wallet-demo.md) (Accepted).

## Files

- Move `features/studio/examples.ts` to `config/examples.ts`; move `ExamplePicker` to `components/ui` with a `label` prop and its own item type (ui may not import config).
- MonGuard: extract `useFindingFocus` and `ScanResults` from the studio tool; add `demo/recorded-reports.json`, `demo/demo-reports.ts` (zod parse), `useMonguardDemo`, `MonguardDemo`.
- GasLens: extract `useGasReportView` and `GasResults`; add the same demo files, `useGaslensDemo`, `GaslensDemo`.
- `app/demo/{layout,page}.tsx`, `app/demo/monguard/page.tsx`, `app/demo/gaslens/page.tsx`; `components/layout/demo-header.tsx` and `demo-nav.tsx`.
- Landing hero secondary button and site header link to `/demo`; sitemap lists the demo instead of protected studio pages; smoke test expects 200 on the demo routes.

## State

Demo state is local: chosen example, results sheet open, focused finding. No draft, no history, no wagmi.

## Recording

Reports come from the real pipeline on the three examples through the running dev server with a signed session. On Groq's free tier the GasHeavy review and its behaviour check together exceed 8,000 tokens a minute, so that check was run on its own a minute later with the same `checkRewrite` code.

## Tests

- Every example has a recorded report; GasLens checks are not `unavailable`.
- The demo opens the recorded report for the chosen example, calls no `fetch` and writes no history.
- The proxy matcher contains no `/demo` path.

## Removed

- `features/studio/examples.ts` and `features/studio/components/example-picker.tsx` (moved).
- Studio pages from the sitemap (they redirect without a session).
- The hero "See what each tool does" button (replaced by the demo link; the tools section is directly below).
