# Connecting a wallet, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-wallet-connection.md](ADR-2026-11-11-wallet-connection.md)

## What is the problem?

Today you have to sign in with email or Google before you can use any tool, and the app makes a new wallet for you. Our users are developers who already have a wallet, so this is an extra step that gets in their way.

## What are we doing about it?

We remove the sign-in. Anyone can open the tools straight away. The only place that needs a wallet is "Deploy", because putting a contract on the network costs a small fee paid from your wallet. There we show the standard "Connect wallet" button that most crypto apps use, which works with MetaMask, Rabby, Coinbase Wallet and phone wallets.

## What changes for people?

Fewer steps to start. People connect the wallet they already use. We no longer depend on Privy.

## What could go wrong?

Someone without a wallet cannot deploy. That is expected for a developer tool; the Deploy panel links to the testnet faucet and explains what is needed.
