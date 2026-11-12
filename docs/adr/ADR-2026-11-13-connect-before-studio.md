# ADR-2026-11-13: Connect a wallet when entering the studio from the landing page

- **Status:** Proposed
- **Approved by:** (name, date; filled in by the maintainer)
- **Companion:** [ADR-2026-11-13-connect-before-studio-for-dummies.md](ADR-2026-11-13-connect-before-studio-for-dummies.md)
- **Supersedes in part:** [ADR-2026-11-11-wallet-connection](ADR-2026-11-11-wallet-connection.md), the points "No login. The studio opens without a wallet." and "the landing page ships none of the wallet code".

## Context

The owner wants the landing page's "Open the studio" buttons to ask for a wallet first, then land on the workspace, so the wallet is the user's identity from the start (activity sync, deploys). First-time visitors should also get a short introduction on each studio screen.

## Options considered

### A. Gate every studio route behind a wallet

Simple to explain, but breaks shared links, the Activity "Open" flow and anyone who just wants to try a scan.

### B. Ask on the landing buttons only, loaded on click

The landing buttons are marked `data-studio-entry`. A small client component on the landing page catches clicks on them, then loads the wallet providers and opens the RainbowKit modal. Connected: go to `/studio`. Already connected: go straight there. Closed without connecting: stay on the landing page. Direct links to the studio still work without a wallet.

## Decision

B. The wallet code loads only after the click (verified: no RainbowKit script on the landing page before it), so the landing page stays as light as before. First-visit introductions are a Radix dialog per screen, remembered in `localStorage` under `monad-studio:seen:<screen>`.

## Diagram

```
landing CTA click ──► StudioEntryGate (capture listener)
                         └─► dynamic import: WalletProviders + useStudioGate
                               ├─ connected ───────────► router.push("/studio")
                               ├─ disconnected ────────► openConnectModal()
                               │     ├─ connect ───────► router.push("/studio")
                               │     └─ close ─────────► stay on landing
studio screen ──► IntroDialog(screen) ──► shown once per browser
```

## Consequences

- Entering from the landing page needs a wallet; the studio itself does not.
- If JavaScript fails, the buttons are plain links to `/studio`.
- The landing fact line now reads "Connect any wallet. No account. Nothing to install. Monad testnet."
- MonadForge, SentinelMon and ParaDebug get their introductions when they are built.
- No packages added.

## Verification

- Unit tests for the click interception and each screen's first-visit dialog.
- Chrome with a mock EIP-6963 wallet: no wallet code before the click, modal on click, closing keeps the landing page, connecting lands on the workspace with its introduction, introduction not shown again, an already connected wallet goes straight to the studio.
