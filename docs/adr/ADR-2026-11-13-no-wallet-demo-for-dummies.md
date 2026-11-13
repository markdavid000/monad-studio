# A demo that works without a wallet, in plain English

- **Status:** Proposed
- **Technical version:** [ADR-2026-11-13-no-wallet-demo.md](ADR-2026-11-13-no-wallet-demo.md)

## What is the problem?

The studio now needs a verified wallet. That keeps it safe, but someone without a wallet, or who is not ready to sign, cannot see what the tools actually do.

## What are we doing about it?

We add a public demo page. You pick one of our three example contracts and run MonGuard or GasLens on it. You see the real report those tools produced for that contract, saved ahead of time. Nothing is sent to the AI, so it costs nothing and cannot be abused. To use the tools on your own contract, you connect your wallet as usual.

## What changes for people?

- A "Try the demo" link on the home page.
- Anyone can see a real security scan and gas review in a few seconds, no wallet needed.
- The studio itself is exactly as protected as before.

## What could go wrong?

The saved reports can go stale if we change how the tools answer. An automatic check fails if a saved report no longer matches what the tool produces, so we will know to re-record it.
