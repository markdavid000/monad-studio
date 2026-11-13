# ADR-2026-11-13: A demo of the tools that needs no wallet

- **Status:** Accepted
- **Approved by:** (MarkDavid, 13th Nov 2026, by merging PR #22)
- **Companion:** [ADR-2026-11-13-no-wallet-demo-for-dummies.md](ADR-2026-11-13-no-wallet-demo-for-dummies.md)

## Context

Since [studio route protection](ADR-2026-11-13-studio-route-protection.md), every studio page and studio API needs a signed wallet session. A visitor without a wallet, or one who does not want to sign yet, now sees nothing of what the tools do. The landing page shows previews, but no real report.

Constraints:

- The protection must not get weaker. `/studio/*`, `/api/monguard/*`, `/api/gaslens/*` and `/api/history*` stay behind the session.
- AI calls cost money and have a per-IP limit of 20 per 10 minutes. Anonymous visitors must not be able to spend that.
- The demo has to show real output, not mock-ups. Directive 4 forbids standing-in data for a broken upstream; a recorded real run is not that, but it must be labelled as a recorded example.

## Options considered

### Option A: Public demo pages with recorded results for the built-in examples

New public routes `/demo`, `/demo/monguard` and `/demo/gaslens`. The visitor picks one of the three built-in example contracts and runs the tool. The result is a report that the real pipeline produced for that contract, saved in the repository as a fixture and checked against the same zod schema as a live reply. The demo makes no API call, saves nothing, and cannot run on a pasted contract. A "Connect wallet to run it on your own contract" button opens the existing connect gate with `next=/studio`.

Cost: three fixtures to record and keep current when a report schema changes (the schema test fails if they drift). No AI spend, no new server surface.

### Option B: Guest sessions with live AI and a lower limit

Unsigned visitors get a guest cookie that unlocks the AI routes at, say, 3 calls per 10 minutes. Real results on any contract.

Cost: reopens the APIs we just closed, IP-based limits are easy to bypass, and AI spend is unbounded across many IPs. Rejected.

### Option C: Live AI, but only on the built-in examples

The server allows unauthenticated calls when the source matches one of the example hashes.

Cost: still spends AI quota for answers we could store, adds an unauthenticated path into the AI routes, and the same contract gives the same answer anyway. Rejected.

## Decision

Option A. The demo lives outside `/studio`, so the proxy matcher and the session checks are unchanged.

- The example contracts move from `src/features/studio/examples.ts` to `src/config/examples.ts`, so the studio and the demo can share them without one feature importing another.
- MonGuard and GasLens each export a demo component from their `index.ts`. It reuses the tool's report view and results sheet, fed from a fixture in the feature (`demo-reports.ts`) that is parsed with the tool's report schema.
- The editor is read-only in the demo. A banner says the results are recorded examples and offers to connect.
- The landing page gets a "Try the demo" link next to "Open Studio".
- The demo is not in the sitemap's studio section but is public and indexable.

## Diagram

```
Visitor (no wallet)
   │
   ├─► /demo ─► pick example ─► Run ─► report from demo-reports.ts (zod-checked) ─► results sheet
   │                                     (no fetch, no history, no AI)
   │
   └─► "Connect wallet" ─► /?connect=1&next=/studio ─► sign ─► /studio (session required, unchanged)
```

## Consequences

- Visitors can see real MonGuard and GasLens output without a wallet or any AI spend.
- The studio protection is unchanged; no new API route and no new unauthenticated path.
- Three recorded reports have to be re-recorded when the prompts or schemas change. A schema test catches drift.
- The demo can only show the three examples, never a pasted contract.
- No packages added or removed.

## Verification

- Unit tests: each fixture parses with its tool's schema; the demo makes no `fetch` call and writes no history.
- Proxy test: `/demo` paths are not matched; smoke test expects 200 on `/demo`, `/demo/monguard` and `/demo/gaslens` without a session, and still 307 on `/studio`.
- Manual: in a browser with no wallet, open the demo from the landing page, run both tools on each example, then use "Connect wallet" and land in the studio.
