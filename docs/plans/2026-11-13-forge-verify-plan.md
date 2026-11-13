# Plan: standalone Verify tab

Completes step 6 of the [rebuild plan](2026-11-11-rebuild-plan.md) under [ADR-2026-11-11-contract-verification](../adr/ADR-2026-11-11-contract-verification.md): "The standalone Verify tab takes address, source, contract name and compiler version, for contracts deployed elsewhere."

## Files

- `POST /api/forge/verify-source` (compile limit): `{ address, fileName, source, contractName, compilerVersion, optimizerEnabled, optimizerRuns, evmVersion }`. The server builds the standard JSON input and calls the existing `submitVerification`.
- `server/compilers.ts`: a short version like `0.8.28` becomes `0.8.28+commit.7893614a` from `binaries.soliditylang.org/bin/list.json`, cached in memory for a day; a full version is used as given; an unreleased version fails without calling Sourcify.
- `useVerifySource`: form state with defaults read from the workspace (last declared contract, version from the pragma, file name from the draft, optimizer off, 200 runs, compiler default EVM version), submit from its own callbacks, a `forge` run `{ kind: "verify", fileName, contractName, address, compilerVersion }`, and the address lookup and polling from `useVerification`.
- MonadForge gets a Build and Verify tab switch; `WorkspaceSummary` and `VerificationStatus` are shared between them.

## Tests

Route: short version resolved, full version used as given, unreleased version, release list down, settings in the input, bad input, limit. Component: defaults from the workspace, live status for the address, the request, verified result, Activity record, reopening a verify run.
