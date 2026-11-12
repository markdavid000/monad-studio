# Dropping the page-speed score check, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-12-remove-lighthouse-gate.md](ADR-2026-11-12-remove-lighthouse-gate.md)

## What is the problem?

Every change had to pass an automatic page-speed score from a tool called Lighthouse. The score is a simulation of a slow phone, and it changes depending on how fast the test machine is. Our landing page loads quickly for real visitors but scored just under the required number on GitHub's slower machines.

## What are we doing about it?

We remove the automatic score check, as we did in Bluff. The written rules for keeping pages fast stay, and reviewers check speed by hand on changes that add weight.

## What changes for people?

Changes stop failing on a number that moves from run to run. Nothing changes for visitors.

## What could go wrong?

A change could make the page slower without anyone noticing. Reviewers look at speed in the browser for any change that adds images, fonts or heavy code.
