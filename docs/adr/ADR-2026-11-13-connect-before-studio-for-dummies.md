# Connecting a wallet on the way into the studio

- **Status:** Proposed
- **Technical version:** [ADR-2026-11-13-connect-before-studio.md](ADR-2026-11-13-connect-before-studio.md)

## What is the problem?

Visitors went straight from the home page into the studio without connecting a wallet, and nothing explained what each screen was for.

## What are we doing about it?

The "Open the studio" buttons on the home page now ask you to connect a wallet first, then take you to the workspace. If your wallet is already connected you go straight in. The first time you open each studio screen, a short window explains what it does; it does not come back after that.

## What changes for people?

- One extra step on the way in: picking a wallet.
- A short welcome on the workspace, Activity, MonGuard and GasLens the first time.
- The home page loads just as fast, because the wallet code only loads when you click.

## What could go wrong?

Someone without a wallet cannot enter from the home page buttons. They can still open a studio link directly. If that turns out to stop people trying the tools, we can add a "continue without a wallet" option.
