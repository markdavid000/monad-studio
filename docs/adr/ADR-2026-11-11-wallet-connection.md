# ADR-2026-11-11: Wallet connection

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Companion:** [ADR-2026-11-11-wallet-connection-for-dummies.md](ADR-2026-11-11-wallet-connection-for-dummies.md)

## Context

Today every route under `/dashboard` and `/studio` is behind a Privy login (email, Google or wallet) that creates an embedded wallet for every user. The owner wants a normal "Connect wallet" instead.

MonadStudio's users are Solidity developers. They already have a browser wallet, and Privy's email login solves a problem they do not have. Bluff chose Privy for the opposite reason: its players have never used a wallet.

Only one action needs a wallet: deploying a contract in MonadForge. Scanning, optimising, generating, monitoring and the conflict viewer read public data or send source code to the server. Gating them behind a login adds a step and protects nothing, because the API routes are public either way (see the AI analysis ADR for how those are protected).

## Options considered

### Gate

- **Gate the whole studio behind a connected wallet.** One more step before anything works, and it is not authentication: anyone can connect any wallet.
- **Connect only where a signature is needed.** The studio opens straight away; the Deploy panel asks for a wallet.

### Connection library

- **RainbowKit on wagmi.** The most common connect modal in EVM apps. Injected wallets, WalletConnect, Coinbase Wallet, a chain switcher and an account modal. Themeable to our tokens. Needs a WalletConnect (Reown) project id, which is public.
- **Reown AppKit.** Similar modal from the WalletConnect team, with optional email and social login we would turn off. Larger bundle.
- **ConnectKit.** Smaller project, fewer wallets listed.
- **Our own dialog on wagmi connectors.** Smallest bundle, full control, but we maintain wallet lists, icons, mobile deep links and edge cases ourselves.

## Decision

- No login. The studio opens without a wallet.
- RainbowKit on wagmi and viem, with Monad Testnet (`monadTestnet` from `viem/chains`) as the only chain. Injected wallets, WalletConnect and Coinbase Wallet. Themed from our CSS tokens.
- A "Connect wallet" button in the studio header shows the address and network once connected. The Deploy panel shows the same button when no wallet is connected and a "Switch to Monad Testnet" button on the wrong chain.
- Wallet providers mount in the `(studio)` route group layout only, so the landing page ships none of the wallet code.
- Deployment uses wagmi's `useDeployContract` and `useWaitForTransactionReceipt`; ethers is removed.

## Diagram

```
 (studio) layout
   └── WagmiProvider ─ QueryClientProvider ─ RainbowKitProvider
          │
          ├── header: <ConnectButton />  (address, network)
          └── forge/Deploy panel
                 ├─ not connected ─► Connect wallet
                 ├─ wrong chain   ─► Switch to Monad Testnet
                 └─ ready         ─► useDeployContract ─► receipt ─► address
```

## Consequences

- The studio is usable in one click from the landing page.
- Deploy works with any EVM wallet, on desktop and mobile through WalletConnect.
- Packages added with the wallet feature: `@rainbow-me/rainbowkit`, `wagmi`, `viem`, `@tanstack/react-query` (already planned).
- Packages removed: `@privy-io/react-auth`, `@privy-io/server-auth`, `ethers`.
- Environment: `NEXT_PUBLIC_PRIVY_APP_ID` removed; `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` added. The owner creates the project id at cloud.reown.com.
- No user accounts, so nothing per-user is stored on the server. Saved monitors stay in the browser.

## Verification

Tests for the Deploy panel's three states (not connected, wrong chain, ready) with a mocked wagmi config. A manual check on Monad testnet: connect MetaMask, switch chain from the prompt, deploy a generated contract, open it in the explorer. Repeat once through WalletConnect on a phone.
