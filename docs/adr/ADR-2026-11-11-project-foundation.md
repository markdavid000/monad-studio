# ADR-2026-11-11: Project foundation

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Superseded in part by:** [ADR-2026-11-12-remove-lighthouse-gate.md](ADR-2026-11-12-remove-lighthouse-gate.md) (Lighthouse)
- **Companion:** [ADR-2026-11-11-project-foundation-for-dummies.md](ADR-2026-11-11-project-foundation-for-dummies.md)

## Context

MonadStudio is a Next.js 14 app with five tools for Monad developers: a security scanner, a gas optimiser, a contract generator and deployer, a transaction monitor and a block conflict viewer. It was written in one commit with no tests, no lint gates, no formatting rules and no review process. The owner wants it rebuilt to the standard of the New Markets frontend and Bluff.

What exists today:

- Next.js 14.2, React 18, Tailwind 3, npm. No tests, no Prettier, `next lint` only.
- Every page is one client component of 400 to 1,250 lines holding state, effects, fetching and rendering together.
- Seven route handlers call Groq and the Monad RPC with no input limits, no validation of the model output and no shared client.
- Dead code and packages: `lib/compiler.ts`, most of `types/index.ts`, `@anthropic-ai/sdk`, `@google/generative-ai`, `zustand`, `@privy-io/server-auth`.
- Known defects: the verify route holds ParaDebug code and reports a false success; the cross-tool prefill writes values nobody reads; settings sits outside the auth guard; `/docs` and `/pricing` are 404s.

MonadStudio has no contracts of its own. It analyses, compiles and deploys contracts the user writes.

## Options considered

### Rebuild approach

- **Refactor in place.** Upgrade Next.js and React, then split each page. Keeps history file by file, but every step runs on a codebase with no gates, and the upgrade from 14 to 16 touches every file anyway.
- **Fresh scaffold, port feature by feature.** Start from the New Markets foundation (the same config files, scripts and gates), then rebuild one tool per pull request, reading the old code and deleting it in the same pull request that replaces it.

### Repository shape

- **pnpm workspace like Bluff** (`apps/web`, `packages/contracts`). Bluff needs it because it ships contracts. MonadStudio does not.
- **Single app like New Markets.** One package, `src/` layers, no workspace overhead.

### Lighthouse

- **Every route, 98 or more, as New Markets.** The tool pages carry a code editor and wallet code, which makes 98 on mobile hard to hold for pages that are used on a laptop.
- **Public routes only.** The landing page must score 98 or more; tool routes are guarded by the performance rules in the standards.
- **None, as Bluff.**

## Decision

- Fresh scaffold, single app, ported one tool per pull request into `dev`. The foundation pull request deletes the whole old app (Replace means remove); each later pull request rebuilds one tool from the old code in git history (`git show 6dc6fa3:<path>`). `main` keeps serving the old app until `dev` holds all five tools and is promoted.
- Stack, matching New Markets: Next.js 16.4 App Router, React 19.3 with the React Compiler, TypeScript strict, Tailwind CSS v4, shadcn/ui, Vitest and Testing Library, ESLint 9 with `eslint-plugin-boundaries`, Prettier with the Tailwind plugin, knip, Lefthook, commitlint, pnpm pinned through `packageManager`, Node 24 through `.nvmrc`.
- Layers exactly as New Markets: `app/`, `components/layout/`, `features/<name>/` (entered only through `index.ts` and `server.ts`), `components/ui/`, `hooks/`, `lib/`, `config/`. Features: `landing`, `wallet`, `monguard`, `gaslens`, `forge`, `sentinel`, `paradebug`.
- Client server state through TanStack Query, as in the New Markets ADR. wagmi needs it already.
- Environment read in one typed module per side (`config/env.ts` for public values, a `server-only` module for secrets), validated with `zod` at startup.
- Gates on commit, push and pull request as New Markets: format, lint, comments, copy, typecheck, tests, knip, build, smoke test, branch flow, gitleaks. Lighthouse on public routes only.
- Branches as New Markets: feature branch into `dev`, `dev` into `staging`, `staging` into `main`. No AI co-author trailers.
- The dashboard's hardcoded zero counters and the settings page are removed: they show nothing real. They come back when there is real data behind them, through their own ADR.

## Diagram

```
src/
├── app/                    routes and route handlers, thin
│   ├── (marketing)/        landing
│   ├── (studio)/           tool routes, wallet and query providers
│   └── api/<tool>/         route handlers calling feature server.ts
├── components/layout/      header, studio nav, footer
├── components/ui/          shadcn primitives
├── features/
│   ├── landing/  wallet/  monguard/  gaslens/
│   └── forge/    sentinel/  paradebug/
├── hooks/  lib/  config/
```

## Consequences

- Every tool gets tests, typed boundaries and validated inputs and outputs.
- About eight pull requests before the rebuild is complete. Between them, `dev` holds only the tools rebuilt so far; `main` keeps the old app until promotion.
- New Markets and Bluff conventions apply unchanged, so moving between the three repositories needs no relearning.
- Packages removed with the old code: `@privy-io/react-auth`, `@privy-io/server-auth`, `@anthropic-ai/sdk`, `@google/generative-ai`, `zustand`, `framer-motion` (until a feature needs motion), `ethers` (replaced by viem), `sonner` (replaced by the shadcn toast if a feature needs one), `clsx` and `tailwind-merge` versions re-added by shadcn.
- Packages added with the foundation: the toolchain above. Feature packages arrive with their feature.
- The owner creates `dev` and `staging` on GitHub and turns on branch protection once.

## Verification

`pnpm preflight` passes on the scaffold. CI runs the same gates on the first pull request. The smoke test returns 200 on every route.
