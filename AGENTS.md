# AGENTS.md

Rules for every AI coding agent working in this repository: Claude Code, Codex, Gemini, Cursor, Copilot, Qwen and any custom harness. They are mandatory. Where this file and a tool's defaults disagree, this file wins.

The coding bar is [`docs/engineering-standards.md`](docs/engineering-standards.md). The code's shape is [`docs/architecture.md`](docs/architecture.md). The human workflow is [`CONTRIBUTING.md`](CONTRIBUTING.md). Read all three before your first change in a session.

---

## Directive 0: Read before you act

No agent edits, creates or deletes anything before it has read the codebase it is about to change.

1. Read this file, the engineering standards and the architecture document.
2. Read every file you will change, the files that import it, and its tests.
3. Read the recent history of that area: `git log --oneline -20 -- <path>`.
4. Search for existing code that already does the job (`rg`, feature `index.ts` files, `src/hooks/`, `src/lib/`, `src/components/ui/`). Extending what exists beats writing something new.
5. Read the current documentation for every framework and library involved: `node_modules/next/dist/docs/` for Next.js, Context7 or the official docs for everything else.
6. State your understanding of the current behaviour and the planned change before the first edit. If you cannot explain how the code works today, you have not read enough.

## Directive 1: Protected branches and worktree isolation

- Never commit or push to `dev`, `staging` or `main`. Branch protection enforces it.
- Do all work in an isolated worktree cut from the branch the work is destined for, normally `origin/dev`:
  `git worktree add .worktrees/<branch> -b <branch> origin/dev`
- Sync before you branch: `git fetch origin dev staging main`. Never trust a local long-lived branch.
- Code flows one way: **feature branch → `dev` → `staging` → `main`**.
  - `dev` is for development. Every feature branch merges here first, and only here.
  - `staging` receives `dev` once its features are ready for testing, and deploys to the Vercel staging URL.
  - `main` receives `staging` once the features are tested, and deploys to production.
- A pull request into `staging` must come from `dev`; a pull request into `main` must come from `staging`. The `branch flow` CI check rejects anything else, including fixes aimed straight at `staging` or `main`: they go through `dev` like everything else.
- Only the repository owner merges into `staging` and `main`. Agents never open, approve or merge promotion pull requests unless that person asks.
- Do not commit or push on a person's behalf unless they ask.
- **Claude, Claude Code and every other AI tool never co-author a commit in this repository.** No `Co-Authored-By` line naming an AI, no `Claude-Session` or other session trailer, no "Generated with" footer, in commits or pull request descriptions. `.claude/settings.json` turns Claude Code's attribution off, and the `commit-msg` hook (commitlint rule `no-ai-attribution`) rejects any commit that carries one. The human who commits is the author.

## Directive 2: Human approval before non-trivial work

Non-trivial means: a new feature, a new dependency, a new layer or folder convention, a change to build, deploy, caching or CI, a data-model change, or anything touching money movement.

Before writing code for it, write two Architectural Decision Records from the templates in `docs/adr/`:

1. `docs/adr/ADR-<YYYY-MM-DD>-<topic>.md`: the technical record (context, options, decision, consequences, diagram).
2. `docs/adr/ADR-<YYYY-MM-DD>-<topic>-for-dummies.md`: the same decision in plain English for non-technical readers.

Then stop. An agent never approves its own ADR or plan. Work starts only after a human explicitly approves both documents.

## Directive 3: Red, then green

Every bug fix starts with a failing test that reproduces the bug. Run it and confirm it fails for the reason you identified. Then write the smallest fix that makes it pass, and run the whole suite.

## Directive 4: No symptom masking

Never make an error, a type error or a failing test go away without fixing its cause:

- no empty or silent `catch` blocks,
- no `@ts-ignore`, `@ts-expect-error`, `any` or non-null assertions to quiet the compiler,
- no dummy, empty or fallback data standing in for a broken upstream,
- no deleting, skipping or weakening a failing test or assertion,
- no `eslint-disable` without a reason, and none where the code can be fixed.

## Directive 5: Agents do not write comments

Code produced by an agent contains no comments: no inline comments, no JSDoc, no commented-out code, no section banners. If a decision needs a recorded reason, put it in the pull request description and let a human decide whether it becomes a comment. Comments written by humans follow the rules in the standards ([Comments](docs/engineering-standards.md#comments)). `pnpm comments:check` runs on every commit.

## Directive 6: Replace means remove

When your change supersedes an existing implementation, the same change deletes the old one with everything it carried: files, exports, styles, tests, assets, routes, environment variables, config and every package only it used. No parallel paths, no `legacy/` folders, no dead flags. `pnpm knip` must report nothing.

## Directive 7: Packages only when used

Add a dependency in the same change that first uses it, never ahead of time. Check that the platform or an existing dependency cannot do the job first. Pin the exact version and give the reason in the PR. Remove a dependency the moment its last user goes.

## Directive 8: React the way the standards say

Use the hook that fits the job (see the [hook table](docs/engineering-standards.md#hooks)). Stateful logic, effects and subscriptions live in custom hooks, never inline in components (see [Custom hooks](docs/engineering-standards.md#custom-hooks)). The React Compiler is on: do not add `useMemo` or `useCallback` by reflex.

## Directive 9: Lighthouse 98 to 100 on public routes

Every public route (the landing page and anything a visitor reaches without opening the studio) scores between 98 and 100 in Performance, Accessibility, Best Practices and SEO on a mobile Lighthouse run. A change that drops any category below 98 is not done; aim for 100. `pnpm lighthouse` checks it; add new public routes to `lighthouserc.json`. Studio routes follow the performance rules in the standards.

## Directive 10: Preflight before done

Before you open a pull request or call a task complete, run `pnpm preflight` and get a clean pass: format, lint, comments, copy, typecheck, tests, knip, production build, smoke test and Lighthouse. Zero errors, zero warnings. Then run the app and use the change yourself. Report anything you could not verify.

## Directive 11: Use the tools you have

Check which MCP servers and skills your environment provides and use them: Context7 for library docs, the Next.js bundled docs, the shadcn registry for UI primitives, Chrome DevTools for Lighthouse and runtime debugging. Do not guess at an API a tool can show you.

---

## Lifecycle

Every task moves through these phases in order.

```
0 READ ─► 1 SYNC ─► 2 DECIDE ─► 3 PLAN ─► 4 ISOLATE ─► 5 BUILD ─► 6 VERIFY ─► 7 DOCUMENT ─► 8 DELIVER
```

| Phase       | What happens                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0. Read     | Directive 0. Understand the code and the docs before anything else.                                                                                    |
| 1. Sync     | `git fetch origin dev staging main`.                                                                                                                   |
| 2. Decide   | Non-trivial work: ADR pair in `docs/adr/`, then wait for human approval (Directive 2).                                                                 |
| 3. Plan     | `docs/plans/<YYYY-MM-DD>-<topic>-plan.md`: files to touch, interfaces, state, test strategy, UI sketch, what gets removed.                             |
| 4. Isolate  | Worktree off the target branch (Directive 1).                                                                                                          |
| 5. Build    | Test-first, within the layer rules, using the hooks rules, adding packages only as used, removing what you replace.                                    |
| 6. Verify   | `pnpm preflight`, then use the change in the running app.                                                                                              |
| 7. Document | Release note in `docs/release-notes/<YYYY-MM-DD>-<topic>.md` from the template, with its `scenario-impact` line. Update any doc the change made wrong. |
| 8. Deliver  | Pull request against the branch you cut from, using the template. CI must pass.                                                                        |

## Pre-review audit

Before asking for review, check the change against each item. The PR template repeats them.

1. **Read first.** You read the code and docs you changed (Directive 0).
2. **Layers.** Imports point down; features are imported only through `index.ts` or `server.ts`; no feature imports another.
3. **Server boundary.** Upstream data is validated and mapped to our types on the server. Components never call `fetch` or hold secrets.
4. **Hooks.** Right hook for each job; stateful logic in custom hooks; no effects for derived state or events.
5. **Tests.** Behaviour tests for the change, covering loading, empty and error states. Bug fixes were red before green.
6. **Money.** Amounts in base units with `bigint`, never `number`.
7. **States.** Every async path has a loading state and an error state; nothing freezes.
8. **Accessibility and Lighthouse.** Keyboard, labels and contrast checked; every touched public route still scores 98 or more in every category.
9. **Copy.** User-facing text lives in `copy.ts`, passes `pnpm copy:check`, and every claim is true of the shipped code.
10. **Comments.** None from an agent; human comments explain why in three lines or fewer.
11. **Cleanup.** Replaced code, assets, config and packages removed; `pnpm knip` clean.
12. **Preflight.** `pnpm preflight` passed with zero warnings.

## Commands

| Command                                                    | Purpose                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                                                 | Local dev server                                           |
| `pnpm preflight`                                           | Every gate, including the build, smoke test and Lighthouse |
| `pnpm preflight --fast`                                    | Everything except build, smoke and Lighthouse (pre-push)   |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm knip` | Individual gates                                           |
| `pnpm comments:check`                                      | Comment rules                                              |
| `pnpm copy:check`                                          | Wording rules for `copy.ts` files                          |
| `pnpm lighthouse`                                          | Lighthouse CI against a production build                   |
| `pnpm smoke`                                               | Start the production build and require 200 on every route  |

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
