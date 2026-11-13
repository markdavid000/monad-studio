---
date: 2026-11-13
branch: feat/forge-deploy
base: dev
scenario-impact: needs_automation
---

# Deploy from MonadForge and verify on Sourcify

After a successful compile, the results layer has a **Deploy** section and the Next step bar a **Deploy <Contract>** button.

- Pick the contract (when the file has more than one), fill in its constructor arguments and, for a payable constructor, the MON to send. Each field is checked against its Solidity type before anything is sent; whole numbers become exact `bigint` values.
- Your wallet signs and sends the deploy on Monad testnet. The toast follows it from "Confirm in your wallet" to "Deploying" to "Contract deployed". Rejecting in the wallet cancels cleanly; a reverted deploy says so.
- The deploy is saved to Activity, and finishes and saves even if you leave the page while it is being mined.
- Right after the deploy, the exact compiler input and version are sent to Monad's Sourcify (`sourcify-api-monad.blockvision.org`). The card shows Submitting, Verifying, then **Verified (exact or partial match)** or Not verified with Sourcify's reason and **Verify again**. "Verified" only appears when Sourcify reports a match.
- The deployed card links the address and transaction to MonadVision; the bar adds **View on MonadVision** and **Deploy again**.

## Not yet

The standalone Verify tab for contracts deployed elsewhere comes next. Tuple constructor arguments are refused with a message.

## Verification

Route tests for every Sourcify answer, argument parsing tests, component tests for the deploy and verification states. Live: the Sourcify server answers `/health`, lists chain 10143 as supported, and a probe job for an empty address completed with `contract_not_deployed` in the shape the code reads. The first real deploy and verification from a wallet is the spike the verification ADR asks for; its result is recorded in that ADR.
