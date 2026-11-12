# ADR-2026-11-11: AI analysis on the server

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Companion:** [ADR-2026-11-11-ai-analysis-on-the-server-for-dummies.md](ADR-2026-11-11-ai-analysis-on-the-server-for-dummies.md)

## Context

Five routes call Groq. Each creates its own client, hardcodes the model (Groq retired `llama-3.3-70b-versatile`, which broke all five at once), asks for JSON in the prompt, strips code fences with a regex, and passes `JSON.parse` output straight to the page. Nothing checks the shape, so a missing field crashes the UI. Two routes swallow errors and return a made-up summary.

The routes accept any input size and have no limit on calls. Anyone who finds the URL spends the Groq quota.

## Options considered

### Output shape

- **Prompt for JSON, parse, hope.** Today's approach.
- **Groq Structured Outputs** (`response_format: { type: "json_schema" }`), supported by `openai/gpt-oss-120b`. The model is constrained to the schema, and the server validates the result again with the same `zod` schema before mapping it to our types.

### Abuse protection

- **None.** Today.
- **Sign-In with Ethereum, then a per-address limit.** Real identity, but adds a login back after the wallet ADR removed it, and a fresh wallet costs nothing.
- **Input caps plus a per-IP rate limit** in a small Redis store (Upstash free tier, reached over HTTP from Vercel functions).

## Decision

- One server-only Groq client in `lib/server/groq.ts`, one model setting from the validated server env (`GROQ_MODEL`, default `openai/gpt-oss-120b`).
- Every tool defines its result as a `zod` schema in its feature, sends it as a JSON schema to Groq, validates the reply with the same schema, and maps it to the feature's types. A reply that fails validation is a 502 with a clear message, never a fallback.
- Inputs validated with `zod`: source code at most 60 KB, prompts at most 2,000 characters, addresses checksummed.
- Per-IP rate limit on AI routes with `@upstash/ratelimit`: 20 calls per 10 minutes, returned as 429 with `Retry-After`.
- Scores are computed in code from the findings (critical 25, high 15, medium 8, low 3, info 1, from 100, floor 0), not chosen by the model.
- Every AI result in the UI is labelled as AI analysis, not an audit.

## Diagram

```
 page ─► feature hook (useMutation) ─► /api/<tool> route handler
                                          │ zod input + rate limit
                                          ▼
                              feature server/analyse.ts
                                          │ prompt + JSON schema
                                          ▼
                                 lib/server/groq.ts ─► Groq
                                          │ zod parse, map to types
                                          ▼
                                 typed result or typed error
```

## Consequences

- A model change is one environment variable.
- Malformed AI output can no longer break a page.
- Scores are consistent with the findings shown.
- Packages added: `groq-sdk` (kept), `zod`, `@upstash/ratelimit`, `@upstash/redis`. Removed: `@anthropic-ai/sdk`, `@google/generative-ai`.
- The owner creates an Upstash Redis database and adds its URL and token to Vercel.

## Verification

Unit tests for each schema mapper with valid, partial and wrong replies. Route handler tests for 400 on oversized input, 429 past the limit and 502 on an invalid model reply, with Groq mocked at the boundary. A manual scan of the example contract on the preview.
