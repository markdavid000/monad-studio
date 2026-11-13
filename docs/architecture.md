# Architecture

This is the shape of the codebase and the rules that keep it that way. ESLint enforces the import rules, so a violation fails `pnpm lint` and CI.

## Model

The project uses a **feature-based architecture with one-way layers**, the structure popularised by [Bulletproof React](https://github.com/alan2207/bulletproof-react) and used by most large Next.js codebases. Code is grouped by what it does for the product (a feature), not by its technical kind. Every import points down the layer diagram, and features never import each other.

Two rules make it hold:

1. **Features have a public entry point.** Outside code imports a feature only through `index.ts` (client-safe) or `server.ts` (server-only). Everything else in the folder is private and free to change.
2. **The lint policy is default-deny.** An import is allowed only if a policy names it. A new folder under `src/` that fits no layer fails lint until the architecture says where it belongs.

## Layers

```
            ┌────────────────────────────┐
            │  app/   routes, layouts,   │
            │         route handlers     │
            └─────────────┬──────────────┘
                          │
            ┌─────────────▼──────────────┐
            │  components/layout/        │
            │  app shell                 │
            └─────────────┬──────────────┘
                          │  (features via index.ts / server.ts only)
            ┌─────────────▼──────────────┐
            │  features/<name>/          │
            │  one folder per product    │
            │  area, never cross-import  │
            └─────────────┬──────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  │
┌──────────────┐   ┌──────────────┐          │
│ components/  │──▶│   hooks/     │          │
│ ui/          │   │ cross-cutting│          │
└──────┬───────┘   └──────┬───────┘          │
       └────────┬─────────┘                  │
                ▼                            ▼
         ┌──────────────┐            ┌──────────────┐
         │    lib/      │───────────▶│   config/    │
         │ pure utils   │            │ static config│
         └──────────────┘            └──────────────┘
```

| Layer                | Holds                                                                                                                               | May import                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/`               | Routes, layouts, metadata files, route handlers. Composes features, owns no logic.                                                  | everything below; features through their entry files only          |
| `components/layout/` | The app shell: header, navigation, footer.                                                                                          | `ui`, `hooks`, `lib`, `config`; features through their entry files |
| `features/<name>/`   | Everything one product area needs: components, hooks, server code, types.                                                           | its own files, `ui`, `hooks`, `lib`, `config`                      |
| `components/ui/`     | Design system primitives from shadcn. Know nothing about any feature.                                                               | `ui`, `hooks`, `lib`                                               |
| `hooks/`             | Hooks needed by two or more features.                                                                                               | `hooks`, `lib`, `config`                                           |
| `lib/`               | Framework-free code needed by two or more features. `lib/server/` holds the server-only clients (env, Groq, Monad RPC, rate limit). | `lib`, `config`                                                    |
| `config/`            | Static configuration: site name, URLs, constants.                                                                                   | `config`                                                           |

## Inside a feature

Create only the folders a feature needs. An empty folder is noise.

```
src/features/<name>/
├── components/      UI for this feature only
├── hooks/           stateful logic for this feature (custom hooks)
├── server/          data access, Server Functions, upstream clients (server-only)
├── lib/             pure logic and mappers for this feature, with tests
├── types.ts         the feature's domain types
├── index.ts         public API for client and server components
└── server.ts        public API for server-only code (route handlers, Server Functions)
```

- `index.ts` exports what the rest of the app may render or call from the client. It never re-exports anything under `server/`.
- `server.ts` starts with `import "server-only"` (add the `server-only` package with the first server module) and exports what route handlers and Server Components need.
- Tests sit next to the file they cover: `price.ts` and `price.test.ts`.

## Where does this go?

| You are adding                                   | Put it in                                                |
| ------------------------------------------------ | -------------------------------------------------------- |
| A page or a route handler                        | `src/app/`, as thin as possible, delegating to a feature |
| UI used by one feature                           | that feature's `components/`, even if it looks generic   |
| A primitive that knows nothing about any feature | `src/components/ui/`, via `pnpm dlx shadcn add`          |
| Stateful logic used by one feature               | that feature's `hooks/`                                  |
| A hook two or more features need                 | `src/hooks/`                                             |
| A pure function two or more features need        | `src/lib/`                                               |
| A call to an upstream API                        | the feature's `server/`, exposed through `server.ts`     |
| A constant shared across the app                 | `src/config/`                                            |

When two features keep needing each other, they are one feature. Merge them; do not open a path between them. When one feature must show another's UI, the route composes them and passes a slot (`children`, a render prop, or a callback).

## Server and client

- Components are Server Components by default. Add `"use client"` only to the smallest component that needs state, effects, event handlers or browser APIs.
- Data is fetched on the server, in a feature's `server/` module, and passed down as props. Components never call `fetch`; lint enforces it for `components/` folders.
- Secrets never reach the client. If a value would need a `NEXT_PUBLIC_` prefix to work, the design is wrong: put the call behind a route handler or a Server Function.
- Upstream responses are validated at the server boundary and mapped to the feature's types. Components only see our types.

## Features

| Feature     | Route                                | Owns                                                               |
| ----------- | ------------------------------------ | ------------------------------------------------------------------ |
| `landing`   | `/`                                  | The public page                                                    |
| `wallet`    | studio header                        | wagmi and RainbowKit config, providers, connect button             |
| `monguard`  | `/studio/monguard`, `/demo/monguard` | Security review: schema, prompt, score, findings UI, recorded demo |
| `gaslens`   | `/studio/gaslens`, `/demo/gaslens`   | Gas review: schema, prompt, diff, findings UI, recorded demo       |
| `forge`     | `/studio/forge`                      | Generate, compile (solc on the server), deploy, verify on Sourcify |
| `sentinel`  | `/studio/sentinel`                   | Watch list, activity polling, flagged patterns                     |
| `paradebug` | `/studio/paradebug`                  | Same-function contention report                                    |
| `activity`  | `/studio/activity`                   | List, filter, reopen and delete saved runs                         |

Source code handed from one tool to another goes through `hooks/use-contract-draft.ts`, never a feature import. Each results layer ends with a `NextStepBar`; sending uses `hooks/use-send-contract.ts` (load the draft, open `/studio/<tool>?run=new`, which the tool turns into one run through `hooks/use-auto-run.ts`), and accepting a MonGuard fix or a GasLens rewrite uses `hooks/use-accept-contract.ts`, which offers Undo. See [the ADR](adr/ADR-2026-11-13-contract-journey.md).

MonadForge compiles on the server with the pinned `solc` package (listed in `serverExternalPackages`), never rewriting the source, and returns the exact standard JSON input and compiler version so a deploy can be verified byte for byte. Deploys and verification go through Sourcify (`features/forge/server/sourcify.ts`); the Verify tab builds the compiler input for contracts deployed elsewhere. `/api/forge/compile` has its own rate limit; `/api/forge/generate` counts against the AI limit.

The three example contracts live in `config/examples.ts`. `/demo` is public and needs no wallet: each tool exports a demo component that shows a report recorded from a real run of each example (`features/<tool>/demo/recorded-reports.json`, parsed with the tool's report schema at load). The demo makes no API call and saves nothing. Re-record those files when a prompt or report schema changes.

Finished runs are saved in the browser's IndexedDB through `lib/history.ts` and `hooks/use-history.ts`. A tool records its own run from its request hook (so a run finishes and is saved even after the user leaves the page), remembers its last run id for the tab in `sessionStorage` (`hooks/use-last-run.ts`) to show it again on return, and validates a saved report with its own schema; the activity feature only sees the shared `HistoryRun` shape, and reopens a run by loading its source into the draft and linking to `/studio/<tool>?run=<id>`.

The studio needs a signed wallet session. `/api/auth/nonce` and `/api/auth/session` run Sign-In with Ethereum (`viem/siwe`, Monad testnet only), shown by RainbowKit as "Verify your account", and set an HTTP-only session cookie signed with `SESSION_SECRET` (`lib/server/session.ts`). `src/proxy.ts` checks it before every studio page and studio API, the studio layout checks it again (`lib/server/require-session.ts`), the route handlers check it inside, and `SessionGuard` signs out when the wallet disconnects or changes. Wallet sync is a switch on top of that session. `/api/history` and `/api/history/[id]` store runs in Upstash under the signed-in address (`lib/server/history-store.ts`): a metadata hash for the list and one key per full run, newest 200, expiring 180 days after the last write. The browser remembers which wallet it synced with (`hooks/use-synced-address.ts`) and pushes each new run.

## Rendering and caching

- The landing page and the demo pages have no request-time data and are prerendered at build time. Studio pages read the session cookie, so they render per request.
- Tool pages are server-rendered shells with one client leaf per interactive panel.
- `fetch` is uncached by default. Upstream calls (Groq, the Monad RPC, Sourcify) are per request and never cached in a shared entry.
- `lib/server/groq.ts` owns every Groq retry (the SDK's own retry is off). A token-limit reply (429) is retried after the wait Groq asks for, within a budget per call (15 s by default, 40 s for the GasLens behaviour check, sized to the routes' `maxDuration`). A 5xx or connection error is retried once. When the budget runs out the route answers `upstream_busy`.
- Cache Components (`cacheComponents`, `"use cache"`) are not used. Turning them on is an ADR.

## Deployment

The app runs on Vercel (see [the ADR](adr/ADR-2026-11-11-hosting-on-vercel.md)). `main` deploys to production, `staging` to a fixed preview URL, and every pull request gets its own preview. Route handlers run on the Node.js runtime; AI and RPC routes set `maxDuration`. CI builds the app and runs `pnpm smoke`, which starts the production server and requires a 200 on every page route.
