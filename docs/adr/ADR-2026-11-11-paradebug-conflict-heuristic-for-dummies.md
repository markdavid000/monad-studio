# What ParaDebug really shows, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-paradebug-conflict-heuristic.md](ADR-2026-11-11-paradebug-conflict-heuristic.md)

## What is the problem?

Monad runs many transactions at the same time, but has to redo some of them when they touch the same data. ParaDebug claims to show which ones ran in parallel, with a percentage and a chart. It cannot see that. It only guesses, and presents the guess as fact.

## What are we doing about it?

We keep the useful part and describe it honestly: ParaDebug shows when the same function of your contract was called several times in one block, which often means those calls fight over the same data. We drop the made-up percentage and chart. We will look into measuring the real data later, if Monad's network allows it.

## What changes for people?

Developers get a true list of busy functions to improve, instead of a number that looks precise but is not.

## What could go wrong?

The page looks less impressive without the chart. Accuracy matters more for a developer tool.
