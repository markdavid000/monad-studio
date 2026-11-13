# Plan: MonadForge deploy and Sourcify verification

Step 6 of the [rebuild plan](2026-11-11-rebuild-plan.md), under [ADR-2026-11-11-contract-verification](../adr/ADR-2026-11-11-contract-verification.md) and the [contract journey ADR](../adr/ADR-2026-11-13-contract-journey.md) (Deploy joins the Next step bar).

## Files

- `lib/args.ts`: constructor arguments from form text to ABI values (address, bool, string, bytes, int and uint as `bigint` with range checks, arrays as JSON); `parseMonValue` with `parseEther`. Tuples are refused with a message.
- `lib/deploy-data.ts`: bytecode plus ABI encoded constructor arguments (`parseAbiParameters`, `encodeAbiParameters`).
- `hooks/use-deploy.ts`: a mutation that sends the deploy transaction with `wagmi/actions` (`sendTransaction` without `to`, chain 10143), waits for the receipt, records a `forge` run `{ kind: "deploy", fileName, result, deployment }` and submits verification, from its own callbacks so leaving the page does not lose it. Wallet rejection is a cancel, a reverted receipt is a failure.
- `hooks/use-deploy-form.ts`: chosen contract (last deployable by default), argument text per contract, MON value when the constructor is payable, errors once a field has text or a deploy was attempted.
- `hooks/use-verification.ts`: submit mutation writes the result into the verification query; the query polls the Sourcify job every 3 s while pending (up to 60 times), looks the address up otherwise, and keeps a verified or failed result.
- `server/sourcify.ts`: `submitVerification`, `verificationStatus`, `contractStatus` against `https://sourcify-api-monad.blockvision.org` (the endpoint Monad's Hardhat and Foundry guides use), chain 10143, 20 s timeout, replies validated with zod. 409 means already verified and is looked up; 400 carries Sourcify's reason; 429 is busy; other failures are unavailable.
- Routes: `POST /api/forge/verify` (compile limit), `GET /api/forge/verify/[id]` and `GET /api/forge/contract/[address]` (sync limit, session).
- UI: `DeployPanel` and `DeploymentCard` in the compile results; Deploy, Deploy again and View on MonadVision in the bar. Explorer links go to MonadVision (`config/site.ts`, `lib/explorer.ts`).

## Not in this step

The standalone Verify tab for contracts deployed elsewhere (next pull request). Tuple constructor arguments.

## Tests

Sourcify routes with fetch mocked (submitted, already verified, rejected, busy, down, job pending, matched, no match, lookup). Argument parsing. Component: validation before sending, transaction data and chain, verification request, Verified only after Sourcify says so, Activity record, explorer link, wallet rejection, reverted deploy.
