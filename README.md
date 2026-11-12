# MonadStudio

Tools for Solidity developers on Monad testnet: a security review, a gas review, a contract generator and deployer, a contract activity monitor and a block contention report.

Next.js 16 (App Router, React 19, React Compiler), TypeScript, Tailwind CSS v4, shadcn/ui, deployed to Vercel.

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

## Read next

| Document                                                         | For                                              |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                             | Setup, scripts, branches, commits, pull requests |
| [`docs/engineering-standards.md`](docs/engineering-standards.md) | The coding bar                                   |
| [`docs/architecture.md`](docs/architecture.md)                   | Layers and import rules                          |
| [`AGENTS.md`](AGENTS.md)                                         | Rules for AI coding agents                       |
| [`docs/adr/`](docs/adr/)                                         | Architectural decisions                          |
| [`docs/plans/`](docs/plans/)                                     | Implementation plans                             |

## Stack

| Concern         | Choice                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Framework       | Next.js 16.4, App Router, React 19.3 with the React Compiler                 |
| Language        | TypeScript, strict                                                           |
| Styling         | Tailwind CSS v4                                                              |
| UI              | shadcn/ui                                                                    |
| Tests           | Vitest, Testing Library                                                      |
| Quality         | ESLint with architecture boundaries, Prettier, knip, copy and comment checks |
| Git hooks       | Lefthook, commitlint                                                         |
| Hosting         | Vercel                                                                       |
| Package manager | pnpm                                                                         |
