# Contributing

Thank you for working on MonadStudio. This guide takes about ten minutes to read and covers everything from your first install to a merged pull request.

## Contents

1. [Before you start](#before-you-start)
2. [Prerequisites](#prerequisites)
3. [Getting set up](#getting-set-up)
4. [Project scripts](#project-scripts)
5. [Where code goes](#where-code-goes)
6. [Branches](#branches)
7. [Making a change](#making-a-change)
8. [Commit messages](#commit-messages)
9. [Pull requests](#pull-requests)
10. [Reviewing](#reviewing)
11. [Quality gates](#quality-gates)
12. [Testing](#testing)
13. [UI components](#ui-components)
14. [Dependencies](#dependencies)
15. [Environment and secrets](#environment-and-secrets)
16. [Deployment](#deployment)
17. [Working with AI agents](#working-with-ai-agents)
18. [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)
19. [Security issues](#security-issues)

## Before you start

Read these once, in full:

- [`docs/engineering-standards.md`](docs/engineering-standards.md): the coding bar. TypeScript, React and hooks, comments, testing, performance, cleanup.
- [`docs/architecture.md`](docs/architecture.md): the layers, the import rules, and where each kind of code lives.
- [`AGENTS.md`](AGENTS.md): the governance rules. Written for AI agents, but the lifecycle and review checklist apply to everyone.

Then read the code you are about to change, its callers and its tests. Nobody changes code they have not read.

## Prerequisites

| Tool    | Version                  | Notes                                                 |
| ------- | ------------------------ | ----------------------------------------------------- |
| Node.js | 24 (see `.nvmrc`)        | `nvm use` or `fnm use` picks it up                    |
| pnpm    | pinned in `package.json` | Enable with `corepack enable`. Never use npm or yarn. |
| Git     | 2.40 or newer            | Worktrees are part of the workflow                    |
| Chrome  | current                  | Needed for `pnpm lighthouse`                          |
| Wallet  | any EVM browser wallet   | Only for testing deploys on Monad testnet             |

## Getting set up

```bash
git clone git@github.com:markdavid000/monad-studio.git
cd monad-studio
corepack enable
pnpm install          # also installs the Git hooks through Lefthook
pnpm dev              # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in the values each feature lists there.

If the hooks are missing (for example after cloning with `--no-checkout`), run `pnpm exec lefthook install`.

## Project scripts

| Script                | What it does                                                      |
| --------------------- | ----------------------------------------------------------------- |
| `pnpm dev`            | Next.js dev server with Turbopack                                 |
| `pnpm build`          | Production build                                                  |
| `pnpm start`          | Serve the production build                                        |
| `pnpm format`         | Format everything with Prettier                                   |
| `pnpm format:check`   | Check formatting only                                             |
| `pnpm lint`           | ESLint, including the architecture boundaries, with zero warnings |
| `pnpm lint:fix`       | ESLint with autofix                                               |
| `pnpm typecheck`      | Generate route types and run `tsc --noEmit`                       |
| `pnpm test`           | Vitest, once                                                      |
| `pnpm test:watch`     | Vitest in watch mode                                              |
| `pnpm knip`           | Unused files, exports and dependencies                            |
| `pnpm comments:check` | The comment rules                                                 |
| `pnpm copy:check`     | The wording rules for `copy.ts` files                             |
| `pnpm smoke`          | Start the production build; every route must return 200           |
| `pnpm lighthouse`     | Lighthouse CI on public routes; every category must be 98 to 100  |
| `pnpm preflight`      | All of the above plus the production build                        |

## Where code goes

Short version. The full rules and the reasons are in [`docs/architecture.md`](docs/architecture.md).

```
src/
├── app/                routes, layouts, route handlers. Thin: composes features.
├── components/
│   ├── layout/         the app shell
│   └── ui/             shadcn primitives
├── features/<name>/    one folder per product area, imported only via index.ts or server.ts
├── hooks/              hooks shared by two or more features
├── lib/                framework-free code shared by two or more features
└── config/             static configuration
```

- Code used by one feature lives in that feature.
- Features never import each other. The route composes them.
- Components never call `fetch`. Data is read on the server and passed down.
- `pnpm lint` fails on any import that breaks these rules.

## Branches

Code flows one way:

```
feature branch ──squash──► dev ──merge──► staging ──merge──► main
                          (develop)      (test)            (production)
```

| Branch    | Purpose                                                   | Accepts pull requests from | Merged by            | Deploys to         |
| --------- | --------------------------------------------------------- | -------------------------- | -------------------- | ------------------ |
| `dev`     | Development. Every feature branch lands here.             | feature branches           | anyone with write    | nothing            |
| `staging` | Testing. Developed features are promoted here and tested. | `dev` only                 | the repository owner | Vercel staging URL |
| `main`    | Production. Tested features are promoted here.            | `staging` only             | the repository owner | Vercel production  |

The rules, all enforced by GitHub:

- No direct pushes to any of the three, for anyone. Every change arrives by pull request.
- The `quality` check must pass before any merge, and the branch must be up to date with its base.
- The `branch flow` check rejects a pull request into `staging` that is not from `dev`, and one into `main` that is not from `staging`. There is no shortcut for urgent fixes: fix on a branch off `dev`, then promote.
- Feature pull requests into `dev` are squash-merged, so `dev` gets one commit per change. Promotions (`dev` into `staging`, `staging` into `main`) use a merge commit, so the three branches keep a shared history and each promotion shows only what is new.
- Only the repository owner can merge into `staging` and `main`.

Feature branches are named `<type>/<short-description>`, using the same types as commits: `feat/order-book`, `fix/price-rounding`, `chore/upgrade-next`.

## Making a change

1. **Pick or open an issue.** One issue, one branch, one pull request.
2. **Decide.** Non-trivial work (a new feature, dependency, folder convention, build or CI change, anything touching money) needs an ADR pair in `docs/adr/`, approved by a maintainer before code is written. See [`docs/adr/README.md`](docs/adr/README.md).
3. **Plan.** For anything larger than a small fix, write `docs/plans/<YYYY-MM-DD>-<topic>-plan.md`.
4. **Branch in a worktree.**
   ```bash
   git fetch origin dev staging main
   git worktree add .worktrees/feat-order-book -b feat/order-book origin/dev
   cd .worktrees/feat-order-book && pnpm install
   ```
5. **Build test-first.** For a bug, write the failing test before the fix.
6. **Remove what you replace.** Old components, styles, assets, config and packages go in the same change.
7. **Verify.** Run `pnpm preflight`, then use the change in the browser, in light and dark mode, on a phone-sized viewport.
8. **Document.** Add a release note in `docs/release-notes/` from the template, and fix any doc your change made wrong.
9. **Open the pull request** against the branch you cut from.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook checks it.

```
<type>(<optional scope>): <summary in the imperative, lower case, no full stop>

<optional body: what changed and why>
```

Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, `revert`, `style`.

```
feat(markets): show the 24h change on market cards
fix(portfolio): round token amounts down, not to nearest
```

Keep commits atomic: one logical change each. AI tools never co-author a commit: no `Co-Authored-By` line for Claude or any other AI, no session trailers, no "Generated with" footers, in commits or PR descriptions. The `commit-msg` hook rejects them, and `.claude/settings.json` turns Claude Code's attribution off.

## Pull requests

- Fill in every section of the template. Unticked boxes need a reason.
- Keep the PR to the scope of its issue. Unrelated fixes get their own PR.
- Include screenshots or a short recording for any UI change, light and dark.
- Include the Lighthouse result for every public route the change touches.
- The `quality` check must be green. If the base branch moved, update your branch and let CI run again.
- Feature pull requests are squash-merged into `dev` and the branch is deleted. Promotions use a merge commit.

## Reviewing

- Open the preview and use the change. Reading a diff is not reviewing a UI.
- These are blocking, not nits: a cross-feature import, a second client for the same upstream, `fetch` in a component, stateful logic inline in a component, an agent-written comment, a replaced implementation left behind, a package added before it is used, a Lighthouse category below 98.
- Approve only what you would be happy to maintain.

## Quality gates

Three layers, from fastest to slowest:

| When         | What runs                                                                                                 | Configured in              |
| ------------ | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| commit       | Prettier and ESLint on staged files, comment and copy rules, commit message lint                          | `lefthook.yml`             |
| push         | `pnpm preflight --fast`: format, lint, comments, copy, typecheck, tests, knip                             | `lefthook.yml`             |
| pull request | Everything above, the production build, the smoke test, Lighthouse, a branch flow check and a secret scan | `.github/workflows/ci.yml` |

Do not bypass hooks with `--no-verify`. If a hook is wrong, fix the hook in its own PR.

## Testing

- Vitest and Testing Library. Tests sit beside the code they cover: `market-card.tsx`, `market-card.test.tsx`.
- Query the way a user does: `getByRole`, `getByLabelText`, `getByText`.
- Cover the states that exist: success, empty, loading, error.
- Test custom hooks with `renderHook`.
- Anything involving amounts or balances gets exact tests with `bigint` values.
- Never weaken or delete a failing test to get a green run.

## UI components

The design system is shadcn/ui on neutral tokens with one accent colour. See [the design ADR](docs/adr/ADR-2026-11-11-design-and-copy.md).

```bash
pnpm dlx shadcn@4.23.0 add <component>
```

- Add a component in the PR that first uses it. Change its `cn` import to `@/lib/utils` and pin any package it adds.
- Theme values live in `src/app/globals.css` (`:root` and the `.dark` block). Change colours there, never in components.
- Merge classes with `cn` from `@/lib/utils`.
- User-facing text goes in `copy.ts`; see [Copy](docs/engineering-standards.md#copy).

## Dependencies

- Add a package only in the change that uses it, with the reason in the PR.
- Exact versions only; `pnpm add --save-exact`.
- Dependabot opens update PRs weekly. Review the changelog; one upgrade per PR.
- When the last user of a package goes, remove the package in the same change. `pnpm knip` fails otherwise.

## Environment and secrets

- Never commit secrets. `.env*` files are ignored except `.env.example`; CI scans every PR with gitleaks.
- Local values go in `.env.local` (copy `.env.example`).
- Deployed values are Vercel environment variables, set per environment (production, preview).
- A secret never gets a `NEXT_PUBLIC_` prefix. If client code seems to need one, route the call through the server.

## Deployment

The app runs on Vercel, connected to this repository:

- a merge to `main` deploys production,
- a merge to `staging` deploys the fixed staging URL,
- every pull request gets its own preview deployment.

The build command is `pnpm build`; Vercel reads the pnpm version from `packageManager`.

## Working with AI agents

AI agents are welcome contributors and follow [`AGENTS.md`](AGENTS.md). As the human driving an agent, you are responsible for its output:

- Approve or reject its ADRs yourself; it may not approve its own.
- Agents do not write code comments. If a comment is needed, you write it.
- Review agent PRs with the same bar as any other.

## Reporting bugs and requesting features

Use the issue templates on GitHub. A good bug report has the steps to reproduce, what you expected, what happened, and the browser and device.

## Security issues

Do not open a public issue for a vulnerability. Follow [`SECURITY.md`](SECURITY.md).
