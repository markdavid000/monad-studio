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

| Feature     | Route               | Owns                                                   |
| ----------- | ------------------- | ------------------------------------------------------ |
| `landing`   | `/`                 | The public page                                        |
| `wallet`    | studio header       | wagmi and RainbowKit config, providers, connect button |
| `monguard`  | `/studio/monguard`  | Security review: schema, prompt, score, findings UI    |
| `gaslens`   | `/studio/gaslens`   | Gas review: schema, prompt, diff, findings UI          |
| `forge`     | `/studio/forge`     | Generate, compile, deploy, verify                      |
| `sentinel`  | `/studio/sentinel`  | Watch list, activity polling, flagged patterns         |
| `paradebug` | `/studio/paradebug` | Same-function contention report                        |
| `activity`  | `/studio/activity`  | List, filter, reopen and delete saved runs             |

Source code handed from one tool to another goes through `hooks/use-contract-draft.ts`, never a feature import.

Finished runs are saved in the browser's IndexedDB through `lib/history.ts` and `hooks/use-history.ts`. A tool records its own run and validates a saved report with its own schema; the activity feature only sees the shared `HistoryRun` shape, and reopens a run by loading its source into the draft and linking to `/studio/<tool>?run=<id>`.

## Rendering and caching

- The landing page and the studio index are Server Components with no request-time data, prerendered at build time.
- Tool pages are server-rendered shells with one client leaf per interactive panel.
- `fetch` is uncached by default. Upstream calls (Groq, the Monad RPC, Sourcify) are per request and never cached in a shared entry.
- Cache Components (`cacheComponents`, `"use cache"`) are not used. Turning them on is an ADR.

## Deployment

The app runs on Vercel (see [the ADR](adr/ADR-2026-11-11-hosting-on-vercel.md)). `main` deploys to production, `staging` to a fixed preview URL, and every pull request gets its own preview. Route handlers run on the Node.js runtime; AI and RPC routes set `maxDuration`. CI builds the app and runs `pnpm smoke`, which starts the production server and requires a 200 on every page route.
