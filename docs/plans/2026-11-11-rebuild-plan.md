# Rebuild plan

## Scope

Implements every ADR dated 2026-11-11: project foundation, wallet connection, hosting on Vercel, AI analysis on the server, design and copy, contract verification, ParaDebug conflict heuristic. The old app is commit `6dc6fa3`; each step reads its tool from there with `git show 6dc6fa3:<path>`.

## Pull requests, in order

Each is a feature branch into `dev`, passes `pnpm preflight`, carries a release note and deletes what it replaces.

| #   | Branch                 | Delivers                                                                                       |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | `chore/foundation`     | Scaffold, gates, CI, docs, landing page, studio shell. Deletes the whole old app.              |
| 2   | `feat/wallet`          | wagmi, RainbowKit, header connect button, network status.                                      |
| 3   | `feat/monguard`        | Server AI core (`groq`, env, rate limit, route helper), contract draft hook, MonGuard.          |
| 4   | `feat/gaslens`         | GasLens on the AI core, diff view.                                                             |
| 5   | `feat/forge-generate`  | Generate and edit; compile route without source rewriting.                                     |
| 6   | `feat/forge-deploy`    | Deploy panel on wagmi; Sourcify spike recorded; verification after deploy and standalone tab. |
| 7   | `feat/sentinel`        | Watch list, polling through TanStack Query, AI anomaly review.                                 |
| 8   | `feat/paradebug`       | Same-function contention report and AI suggestions.                                            |

`dev` is promoted to `staging` and `main` by the owner after step 8.

## Files

```
src/
├── app/
│   ├── layout.tsx                    root: html, theme provider, metadata
│   ├── page.tsx                      landing
│   ├── robots.ts  sitemap.ts  not-found.tsx  error.tsx
│   ├── studio/
│   │   ├── layout.tsx                studio header; wallet and query providers (step 2)
│   │   ├── page.tsx                  tool index
│   │   └── <tool>/page.tsx           monguard, gaslens, forge, sentinel, paradebug
│   └── api/<tool>/<action>/route.ts  thin: parse, rate limit, call feature server.ts
├── components/
│   ├── layout/                       site-header, studio-header, site-footer, theme-toggle
│   └── ui/                           shadcn primitives, added as used
├── features/
│   ├── landing/                      hero, tool rows, sample result, copy.ts
│   ├── wallet/                       providers, connect button, network badge, wagmi config
│   ├── monguard/  gaslens/  forge/  sentinel/  paradebug/
│   │   ├── components/  hooks/  lib/  server/
│   │   ├── copy.ts  types.ts  queries.ts (where polling)
│   │   └── index.ts  server.ts
├── hooks/use-contract-draft.ts       source handed between monguard, gaslens and forge
├── lib/
│   ├── utils.ts                      cn
│   ├── severity.ts                   severity order and score (monguard, sentinel)
│   └── server/                       server-only: env, groq, monad public client, rate limit, json route helper
└── config/site.ts  config/tools.ts  config/env.ts (public, validated)
```

## Interfaces

- Route handlers return `{ data }` with 200, or `{ error: { code, message } }` with 400 (input), 429 (rate limit, `Retry-After`), 502 (upstream or invalid AI reply) or 500.
- Each feature's `server.ts` exports one function per action, taking validated input and returning a typed result or throwing a typed `UpstreamError`.
- Each feature's `lib/schema.ts` exports the `zod` schema sent to Groq and the mapper to the feature's types.
- `useContractDraft(): { source: string; setSource(source: string): void }` over `sessionStorage` with `useSyncExternalStore`.
- Client hooks per feature: `useScan`, `useGasAnalysis`, `useGenerate`, `useCompile`, `useDeploy`, `useVerify`, `useWatchList`, `useContractActivity`, `useContention`. Each returns `{ status: "idle" | "pending" | "success" | "error", data, error, run }` or the TanStack Query equivalent.

## State

- Writes (scan, analyse, generate, compile, verify, contention scan): `useMutation` in the feature hook.
- Polling (sentinel activity): `useQuery` with `refetchInterval` 4 s, keyed by address and last block, so requests never overlap.
- Watch list: `localStorage` through `useSyncExternalStore`.
- Deploy: wagmi `useDeployContract` and `useWaitForTransactionReceipt`, wrapped in `useDeploy`.
- Verification: `useMutation` to submit, then `useQuery` polling the job until it settles.

## Wording

Every user-facing string in the feature's `copy.ts`. `react/jsx-no-literals` enforces it; `pnpm copy:check` rejects dashes, emoji, exclamation marks and the filler list in the design ADR.

## Tests

- Landing: heading, every tool listed, no link to a missing route.
- Each schema mapper: valid, partial and wrong replies.
- Each route handler: 400, 429, 502 and success, with Groq, RPC and Sourcify mocked at `fetch`.
- MonGuard score: exact values for each severity mix, floor at zero.
- Diff: unchanged, added, removed and a 400-line input.
- Deploy panel: not connected, wrong chain, ready, pending, failed, success.
- Verification: "Verified" never renders before a success response.
- Sentinel: watch list add, duplicate, invalid, remove; activity loading, empty, error.
- ParaDebug grouping: no collisions, one hot function, collisions across blocks.

## UI

Sketches are in the design ADR. Every async panel has idle, pending, success, empty and error states, and keeps its height while loading.

## Removal

Step 1 removes every file of the old app and these packages: `@anthropic-ai/sdk`, `@google/generative-ai`, `@privy-io/react-auth`, `@privy-io/server-auth`, `zustand`, `framer-motion`, `ethers`, `sonner`, `solc` (re-added in step 5), `groq-sdk` (re-added in step 3), `viem`, `wagmi` and `@tanstack/react-query` (re-added in step 2). Environment variables removed: `NEXT_PUBLIC_PRIVY_APP_ID`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_MONAD_CHAIN_ID`, `NEXT_PUBLIC_APP_URL`.

## Not in this plan

A code editor component (textarea until an ADR decides otherwise), storage tracing for ParaDebug, user accounts, a dashboard.
