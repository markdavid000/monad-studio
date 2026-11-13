---
date: 2026-11-13
branch: feat/forge-verify
base: dev
scenario-impact: needs_automation
---

# Verify a contract deployed outside MonadForge

MonadForge has two tabs: **Write, compile, deploy** (as before) and **Verify a deployed contract**.

- Enter the address of any contract on Monad testnet. Its Sourcify status shows as soon as the address is complete.
- The source is the contract in your workspace. The contract name, compiler version (from the pragma) and file name are filled in from it; set the optimizer, runs and EVM version to match how it was built.
- A short compiler version such as `0.8.28` is turned into the full build Sourcify needs (`0.8.28+commit.7893614a`) from the official Solidity release list.
- **Verify on Sourcify** submits it and the status follows the job to Verified (exact or partial match) or Not verified with Sourcify's reason. An address that is already verified says so.
- Each submission is saved to Activity and reopens on the Verify tab with its address.

## Verification

Route and component tests. Live: the contract deployed in the spike was looked up and submitted again from the Verify tab with its source from Sourcify and version `0.8.38`; Sourcify answered that it is already verified with an exact match.
