# Where the app runs, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-hosting-on-vercel.md](ADR-2026-11-11-hosting-on-vercel.md)

## What is the problem?

Some of MonadStudio's work happens on our server: turning a contract into deployable code, and asking the AI to review it. That work is heavier than in our other projects, and Cloudflare's free plan, which New Markets uses, cannot run it.

## What are we doing about it?

We host on Vercel, the company that makes Next.js, as we already do for Bluff. Its free plan runs the heavy parts without changes, and every proposed change gets its own preview link to try before it goes live.

## What changes for people?

Nothing visible for users. Reviewers get a link for every change. It is free while the project is non-commercial.

## What could go wrong?

If MonadStudio becomes a paid product, the free plan no longer applies and we move to Vercel's paid plan.
