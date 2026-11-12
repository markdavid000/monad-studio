# Rebuilding MonadStudio on a solid base, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-project-foundation.md](ADR-2026-11-11-project-foundation.md)

## What is the problem?

MonadStudio works in places, but it was built quickly with no checks: nothing tests it, nothing stops a mistake from shipping, and some features quietly do the wrong thing. One button says a contract is verified when it is not.

## What are we doing about it?

We start a clean copy of the app using the same setup as our other two projects, New Markets and Bluff, then move each of the five tools across one at a time. Each tool is rewritten with tests, and its old version is deleted as soon as the new one lands. A page that shows fake numbers is removed until it has real ones.

## What changes for people?

Users get the same five tools, working correctly. The team gets automatic checks on every change and the same rules as the other projects. It takes about seven separate changes to finish; the current app stays live until then.

## What could go wrong?

The rebuild could stall halfway and leave two versions. We avoid that by replacing one whole tool at a time, so the app is always complete.
