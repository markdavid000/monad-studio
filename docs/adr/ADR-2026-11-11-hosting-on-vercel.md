# ADR-2026-11-11: Hosting on Vercel

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Companion:** [ADR-2026-11-11-hosting-on-vercel-for-dummies.md](ADR-2026-11-11-hosting-on-vercel-for-dummies.md)

## Context

New Markets runs on Cloudflare Workers through OpenNext; Bluff moved to Vercel because the owner prefers it. MonadStudio has more server work than either:

- The compile route runs `solc` in Node. `node_modules/solc/soljson.js` is 9.4 MB, and one compile takes hundreds of milliseconds of CPU.
- The AI routes wait 4 to 30 seconds on Groq.
- The monitor and conflict viewer make dozens of RPC calls per request.

Workers Free allows 10 ms of CPU per request and a 3 MB compressed Worker. The compiler alone breaks both limits; the paid plan raises them but `solc` would still dominate the bundle.

## Options considered

### Cloudflare Workers via OpenNext

Same flow as New Markets. Needs the paid plan, and `solc` moved to an external service or into the browser, which loses the server-side compile the deploy and verify flows rely on.

### Vercel

Node.js functions with no adapter, a 250 MB function limit, and up to 300 seconds of duration with Fluid compute on Hobby. Preview deployment for every pull request. Hobby forbids commercial use.

### Compile in the browser

The old `lib/compiler.ts` loaded `solc` from a CDN into the page. Frees the server, but ships 9 MB to every user of the Deploy panel and blocks the main thread.

## Decision

Host on Vercel, Hobby plan, connected to the GitHub repository, as Bluff.

- Production deploys from `main`; `staging` deploys to a fixed preview URL; every pull request gets a preview.
- Route handlers run on the Node.js runtime. AI and RPC routes set `maxDuration` to 60 seconds.
- CI keeps a build gate: `next build`, then a smoke test that runs `next start` and requires a 200 on every page route.
- No OpenNext, Wrangler or Worker smoke test.

## Diagram

```
 GitHub ── pull request ──► CI (quality) ──► merge
   │                                           │
   ▼                    ▼                      ▼
 Vercel preview     Vercel staging URL     Vercel production
 (every PR)         (staging branch)       (main branch)
                         │
                Node functions: solc, Groq, Monad RPC
```

## Consequences

- The compiler and long AI calls work without workarounds.
- Preview links on every pull request.
- Commercial use would need Vercel Pro or a move.
- The owner connects the repository in the Vercel dashboard and adds the server secrets (`GROQ_API_KEY` and the rate limit store) as environment variables.

## Verification

CI's build and smoke test pass. A pull request shows a Vercel preview where a contract compiles through `/api/forge/compile`.
