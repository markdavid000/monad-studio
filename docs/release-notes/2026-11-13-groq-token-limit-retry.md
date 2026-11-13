---
date: 2026-11-13
branch: fix/groq-rate-limit-retry
base: dev
scenario-impact: needs_automation
---

# AI calls wait out Groq's per-minute token limit

Groq's free tier allows 8,000 tokens a minute. A GasLens review of a larger contract plus its behaviour check needs more than that, so the check often came back "Behaviour check did not run". The Groq SDK retried once after the wait Groq asked for and then gave up, and that one hidden retry could use up most of the time we had.

Every Groq call now goes through one retry policy in `lib/server/groq.ts`:

- A token-limit reply (429) is retried after the wait Groq asks for (at least 4 s, doubling, at most 20 s per wait), as long as it fits the call's budget: 15 s by default, 40 s for the behaviour check. Both fit the routes' `maxDuration` (60 s scan, 120 s gas review).
- A 5xx or connection error is retried once after 1 s, as the SDK did before. Timeouts are not retried.
- The SDK's own retry is off, so waits are not counted twice.
- When the budget runs out, the route answers with a new `upstream_busy` code and the tools say "The AI service reached its per-minute limit. Try again in a minute." with a retry button, instead of "did not respond".

## Limits

Two large reviews at the same moment need about 18,000 tokens in a minute. Waiting inside one request cannot fit that, so under concurrent use one of them can still end with the busy message or an unchecked rewrite. Groq's paid tier removes that ceiling.

## Verification

- Route tests with fake timers: the check waits out three token-limit replies, waits out a 17 s request, and gives up within its budget; MonGuard waits out two and returns `upstream_busy` when the limit outlasts the budget. The 17 s case failed before the fix.
- UI test: the busy message and the retry button.
- Live on port 3000: GasHeavy reviewed five times back to back, every behaviour check finished; with two reviews at once, the check of the first waited 20 s and finished.
