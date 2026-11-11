---
date: 2026-11-11
branch: chore/foundation
base: dev
scenario-impact: needs_automation
---

# A new foundation, a plain landing page and an empty studio

The old app is gone from `dev`. Visitors see a landing page that says what each tool does, and a studio page that lists the tools. Each tool comes back, rebuilt, in its own pull request.

## Changes

- Next.js 16.4, React 19.3 with the React Compiler, Tailwind CSS v4, shadcn/ui, Vitest, pnpm and Node 24.
- Gates on commit, push and pull request: format, lint with layer boundaries, comments, copy, typecheck, tests, knip, build, smoke test, Lighthouse on public routes, branch flow and gitleaks.
- Landing page: plain headline, what each tool outputs, an honest note that reviews come from an AI model. Light and dark theme.
- Studio shell: header with the tool links that exist, the network name and the theme toggle; `/studio` lists the tools.
- `AGENTS.md`, `CONTRIBUTING.md`, the engineering standards, the architecture document and the ADRs.

## Removed

- Every file of the previous app: pages, route handlers, components, `lib/`, `types/`, `test-debug.mjs`, Tailwind 3 and PostCSS config, `package-lock.json`.
- Packages: `@anthropic-ai/sdk`, `@google/generative-ai`, `@privy-io/react-auth`, `@privy-io/server-auth`, `zustand`, `framer-motion`, `ethers`, `sonner`, `solc`, `groq-sdk`, `viem`, `wagmi`, `@tanstack/react-query`, `clsx`, `tailwind-merge`. The tool pull requests add back only what they use.
- Environment variables: `NEXT_PUBLIC_PRIVY_APP_ID`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_MONAD_CHAIN_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MONAD_TESTNET_RPC`.

## Verification

- Tests for the hero, the tools section and the tool list (every tool listed, links only where a route exists).
- `pnpm preflight` passed, including Lighthouse on `/`.
- Opened `/`, `/studio` and an unknown route in light and dark mode at phone width.
