# A landing page that shows the product, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-landing-design-v2.md](ADR-2026-11-11-landing-design-v2.md)

## What is the problem?

The first version of the front page was clean but plain: a headline and a list. It told people what the tools do instead of showing them.

## What are we doing about it?

We follow the style of CodeRabbit's site, which the owner picked: a dark page, a sharper font, and realistic previews of each tool at work, including a set of tabs under the headline that steps through the tools on its own. Every preview is marked "Example output" so nobody mistakes it for a live result.

## What changes for people?

Visitors see what each tool produces before they open it. The page still loads quickly on a phone; we measured it.

## What could go wrong?

The previews could drift from what the tools really produce. Each tool's rebuild checks its preview against the real thing.
