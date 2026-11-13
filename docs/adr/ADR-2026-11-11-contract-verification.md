# ADR-2026-11-11: Contract verification

- **Status:** Accepted; Sourcify spike passed on 13 Nov 2026 (see Spike result)
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Companion:** [ADR-2026-11-11-contract-verification-for-dummies.md](ADR-2026-11-11-contract-verification-for-dummies.md)

## Context

MonadForge offers "Verify on MonadVision" after a deploy and a standalone Verify tab. Neither works: `app/api/monadforge/verify/route.ts` contains a copy of ParaDebug's AI suggestion code, returns 200 with no verification, and the page then shows "Verified". This is a false claim about a user's public contract.

Three things in the current compile path would also stop a real verification from matching:

- The compile route rewrites the source (comments out bare `SPDX-License-Identifier` lines, turns `revert;` into `revert();`), so the deployed bytecode does not come from the source the user sees.
- It compiles with `metadata.bytecodeHash: "none"`, which removes the metadata hash Sourcify uses for a full match.
- The compiler version comes from whatever `solc` npm version is installed, and the UI tells users it is 0.8.20.

Monad's explorers read verified sources from Sourcify. Monad documents a Sourcify instance for testnet; the exact endpoint is confirmed in the spike below.

## Options considered

- **Remove verification.** Honest, but loses a useful step.
- **Sourcify API v2** (`POST /v2/verify/{chainId}/{address}` with the standard JSON input, compiler version and `contract.sol:Name`, then poll the job). No API key. What Hardhat and Foundry use on Monad.
- **An Etherscan-style API on an explorer.** Needs an API key per explorer and is explorer-specific.

## Decision

- Verify through Monad testnet's Sourcify instance, from a route handler in the `forge` feature.
- The compile route never rewrites source. Compile errors are shown to the user as they are.
- Compile with the default metadata settings (IPFS hash kept), optimizer on, 200 runs, and return the exact standard JSON input and full compiler version with the bytecode. The Deploy panel keeps both and sends them to verification, so what is verified is byte for byte what was deployed.
- The UI shows four states: submitting, pending (Sourcify job polling), verified (full or partial match, with the explorer link) and failed (Sourcify's message). "Verified" appears only when Sourcify says so.
- The standalone Verify tab takes address, source, contract name and compiler version, for contracts deployed elsewhere.
- `app/api/monadforge/debug/route.ts` and `test-debug.mjs` are removed; the Sourcify response replaces them as the diagnostic.

### Spike (before the forge pull request)

On Monad testnet: compile a contract with the new settings, deploy it from a wallet, submit it to the Sourcify endpoint, and confirm the explorer shows the verified source. Record the endpoint, timings and result in this ADR.

### Spike result (13 Nov 2026)

Run by MarkDavid from MetaMask through MonadForge on `feat/forge-deploy`.

- **Endpoint:** `https://sourcify-api-monad.blockvision.org` (Sourcify API v2, run by BlockVision, the host Monad's Hardhat and Foundry guides use). `/chains` lists Monad testnet 10143 and mainnet 143 as supported.
- **Contract:** `CappedMintableToken`, written by MonadForge, compiled with `0.8.38+commit.1835d247`, optimizer on at 200 runs, `evmVersion` prague, default metadata. Deployed at `0xe5665A69afA64028837B36632636E97CA8d7C59b`, transaction `0xcad7aa55875be4ad257c37d2295ced032229c607eb3e624bed6966e450129a2c`, block 79403224.
- **Request:** `POST /v2/verify/10143/{address}` with the exact standard JSON input returned by the compile route, the compiler version, `CappedMintableToken.sol:CappedMintableToken` and the creation transaction hash. 202 with a job id; one poll of `GET /v2/verify/{id}` found it complete.
- **Timing:** block at 13:59:33 UTC, verified at 13:59:38 UTC. Our submit took 3.4 s and the poll 2.9 s end to end.
- **Result:** `exact_match` for both creation and runtime bytecode (Sourcify match id 69570). The settings kept in this ADR (no source rewriting, IPFS metadata hash kept) are what made the exact match possible.

## Diagram

```
 Deploy panel ──► /api/forge/compile ──► { abi, bytecode, stdJsonInput, compilerVersion }
      │                                                   │ kept in state
      ▼                                                   ▼
 wallet deploy ──► address ──► /api/forge/verify ──► Sourcify v2 ──► job id
                                                         │ poll
                                                         ▼
                                       verified (full / partial) or failed
```

## Consequences

- No false "Verified" state anywhere.
- Users can verify contracts they deployed here or elsewhere.
- No new packages; Sourcify is plain HTTPS.
- If Monad's Sourcify instance is unavailable, verification shows the failed state with Sourcify's message.

## Verification

The spike passes and is recorded here. Route tests with Sourcify mocked: full match, partial match, already verified, no match, job timeout. A component test proves "Verified" never renders before a success response.
