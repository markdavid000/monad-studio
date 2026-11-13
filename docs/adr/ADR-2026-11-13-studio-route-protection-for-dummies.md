# Only verified wallets can use the studio

- **Status:** Proposed
- **Technical version:** [ADR-2026-11-13-studio-route-protection.md](ADR-2026-11-13-studio-route-protection.md)

## What is the problem?

Anyone could open a studio link directly, or call the tools behind it, without a wallet. Simply checking "is a wallet connected" in the browser is easy to fake, so it does not protect anything.

## What are we doing about it?

To enter the studio you connect your wallet and sign one short message that proves the wallet is yours. It is free and sends no transaction. Our server checks that proof on every studio page and every tool request. Without it, pages send you back to connect and the tools refuse to answer. If you disconnect or switch wallets while in the studio, you are signed out straight away.

## What changes for people?

- One extra click after connecting: "Sign message". It lasts 7 days in that browser.
- Shared studio links now ask for a wallet first, then open the page that was shared.
- Syncing activity no longer needs a second signature.

## What could go wrong?

People without a wallet cannot try the tools at all. If that costs us visitors, we can add a demo that does not need one.
