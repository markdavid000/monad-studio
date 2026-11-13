---
date: 2026-11-13
branch: feat/no-wallet-demo
base: dev
scenario-impact: needs_automation
---

# A demo that needs no wallet

`/demo` lets anyone try MonGuard and GasLens without a wallet. Pick one of the three example contracts and open the report the real tools produced for it. Nothing is sent to the AI and nothing is saved. A banner says the results are recorded, and "Connect wallet" leads into the studio as usual.

## Changes

- New public routes `/demo`, `/demo/monguard`, `/demo/gaslens` with their own header, tool tabs and banner.
- Recorded reports for all three examples in both tools, checked against each tool's report schema.
- The home page hero and header link to the demo; the sitemap lists the demo pages.
- Example contracts moved to `config/examples.ts`; the example picker moved to `components/ui`.
- The studio tools now share their results view with the demo (`ScanResults`, `GasResults`, `useFindingFocus`, `useGasReportView`). Behaviour unchanged. Code panels take a `canEdit` flag, so the demo hides "Edit in workspace".
- ADR `ADR-2026-11-13-no-wallet-demo` marked Accepted.

## Removed

- Protected studio pages from the sitemap.
- The hero's "See what each tool does" button.

## Verification

- Tests: recordings cover every example; the demo makes no request and saves nothing; the proxy leaves `/demo` public.
- Smoke test: demo routes 200 without a session, studio routes still 307.
- Chrome, no wallet: home, demo, both tools on each example, connect button.
