# Using the AI safely, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-ai-analysis-on-the-server.md](ADR-2026-11-11-ai-analysis-on-the-server.md)

## What is the problem?

Four of the tools ask an AI model to review code. Today the app trusts whatever the AI sends back, so an odd answer can break the page. Anyone on the internet can also use our AI account through the app without limit, and we pay for it.

## What are we doing about it?

We tell the AI the exact shape its answer must have and check every answer before showing it. We limit how much code one request can send and how many requests one visitor can make in ten minutes. The security score is worked out by the app from the problems found, so it always matches the list.

## What changes for people?

Fewer broken screens, consistent scores, and a clear message when someone hits the limit. We add one small free service (Upstash) to count requests.

## What could go wrong?

A heavy user might hit the limit. The limit is set generously and is easy to change.
