---
date: 2026-11-11
branch: chore/foundation
base: dev
scenario-impact: needs_automation
---

# A new foundation, a landing page that shows the product, and an empty studio

The old app is gone from `dev`. Visitors see a landing page that says what each tool does, and a studio page that lists the tools. Each tool comes back, rebuilt, in its own pull request.

## Changes

- Next.js 16.4, React 19.3 with the React Compiler, Tailwind CSS v4, shadcn/ui, Vitest, pnpm and Node 24.
- Gates on commit, push and pull request: format, lint with layer boundaries, comments, copy, typecheck, tests, knip, build, smoke test, branch flow and gitleaks.
- Landing page in the style of CodeRabbit (see the landing design v2 ADR): dark by default, Geist headlines, a headline verb that changes letter by letter with the five-tab showcase, an accordion of example tool output with scenes that play, a flowing-lines section, a marquee of what the reviews check, sections that reveal on scroll with a travelling colour bar, a sticky scroll section on how a review is built, and a footer with an outlined wordmark. Wider container. Light theme through the toggle; all motion stops under reduced motion.
- Studio shell: header with the tool links that exist, the network name and the theme toggle; `/studio` lists the tools.
- `AGENTS.md`, `CONTRIBUTING.md`, the engineering standards, the architecture document and the ADRs.

## Removed

- Lighthouse CI: `lighthouserc.json`, the `lighthouse` script and `@lhci/cli`.
- Every file of the previous app: pages, route handlers, components, `lib/`, `types/`, `test-debug.mjs`, Tailwind 3 and PostCSS config, `package-lock.json`.
- Packages: `@anthropic-ai/sdk`, `@google/generative-ai`, `@privy-io/react-auth`, `@privy-io/server-auth`, `zustand`, `framer-motion`, `ethers`, `sonner`, `solc`, `groq-sdk`, `viem`, `wagmi`, `@tanstack/react-query`, `clsx`, `tailwind-merge`. The tool pull requests add back only what they use.
- Environment variables: `NEXT_PUBLIC_PRIVY_APP_ID`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_MONAD_CHAIN_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_MONAD_TESTNET_RPC`.

## Verification

- Tests for the hero stage (stable heading, changing verb, tabs, previews, arrow keys, auto-advance, pause), the in-view hook, the landing sections (links only where a route exists, diagram, marquee) and the studio tool list.
- `pnpm preflight` passed. Lighthouse was removed as a gate (see ADR-2026-11-12-remove-lighthouse-gate); the last runs scored 0.95 to 1.00 for performance and 1.00 elsewhere.
- Opened `/`, `/studio` and an unknown route in light and dark mode at phone width.
