# ADR-2026-11-12: Remove the Lighthouse gate

- **Status:** Accepted
- **Approved by:** (MarkDavid, 12th Nov 2026, in the review of pull request #1)
- **Supersedes:** the Lighthouse part of [ADR-2026-11-11-project-foundation.md](ADR-2026-11-11-project-foundation.md)
- **Companion:** [ADR-2026-11-12-remove-lighthouse-gate-for-dummies.md](ADR-2026-11-12-remove-lighthouse-gate-for-dummies.md)

## Context

The foundation ADR required every public route to score 98 or more in all four Lighthouse categories on a mobile run, checked in CI. On the approved landing page, CI's runner scored performance at 0.95 to 0.96, while a local run scored 0.96 to 1.00. Accessibility, best practices and SEO scored 1.00 everywhere. The observed largest contentful paint is about 150 ms; the failing figure is Lighthouse's simulated slow 4G, which scales with the runner's CPU and swings between runs. Bluff runs without a Lighthouse gate for the same kind of reason.

## Options considered

- **Keep the gate at 98** and trim the landing page until CI passes. Costs design work the owner has just approved.
- **Lower the bar to 95** for the landing page. Keeps a gate that still swings with runner speed.
- **Remove the gate**, as Bluff does, and keep the performance rules in the standards.

## Decision

Remove Lighthouse from CI and from `pnpm preflight`. Remove `lighthouserc.json`, the `lighthouse` script and `@lhci/cli`. AGENTS.md Directive 9 becomes "Fast public pages", pointing at the performance rules in the standards.

## Consequences

- Pull requests no longer fail on simulated mobile scores.
- Page speed and accessibility are guarded by review and the standards' rules, not by a number.
- A large regression could land unnoticed; reviewers check Chrome DevTools on changes that add weight.
- Packages removed: `@lhci/cli`.

## Verification

CI's `quality` check passes on pull request #1 without a Lighthouse job.
