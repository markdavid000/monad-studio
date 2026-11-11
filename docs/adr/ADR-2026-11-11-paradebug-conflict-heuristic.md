# ADR-2026-11-11: ParaDebug conflict heuristic

- **Status:** Accepted
- **Approved by:** (MarkDavid, 11th Nov 2026)
- **Companion:** [ADR-2026-11-11-paradebug-conflict-heuristic-for-dummies.md](ADR-2026-11-11-paradebug-conflict-heuristic-for-dummies.md)

## Context

ParaDebug presents itself as a parallel execution visualiser: it labels transactions "parallel" or "sequential", shows a percentage parallel and draws a Gantt chart. None of that is measured. The route marks a transaction "sequential" when an earlier transaction in the same block called the same function selector on the same contract. The chart's start times are `index / count`. Monad's RPC does not expose which transactions were re-executed by the parallel scheduler.

Calls to the same function in one block are a reasonable signal of storage contention, but they are not the same thing: two `transfer` calls between different accounts touch different slots, and two different functions can write the same slot.

## Options considered

- **Keep the current labels.** Misleads developers about their contract.
- **Measure real conflicts.** Trace each transaction (`debug_traceTransaction` with the prestate tracer) to get the storage slots it read and wrote, then find overlapping writes within a block. Accurate about state overlap, but Monad's public testnet RPC limits debug methods, and it still describes overlap, not the scheduler's decisions.
- **Keep the heuristic and name it honestly.** Show "same-block calls to the same function" as possible contention, with the evidence, and explain what it does and does not mean.

## Decision

- Name it what it is. The tool reports **possible contention**: groups of calls to the same function of the contract within one block, with counts per function and per block.
- Remove "parallel" and "sequential" labels, the parallel percentage and the Gantt chart.
- Show per block: transactions to the contract, and the functions called more than once. Per function: how often it collides across the scanned range. Decode selectors with the contract's ABI when the contract is verified on Sourcify; otherwise show the selector.
- AI suggestions stay, labelled as AI suggestions, and are given the function names and collision counts.
- Storage tracing is a separate ADR if the RPC supports it; the spike is to call `debug_traceTransaction` with `prestateTracer` and `diffMode` on the public testnet RPC.

## Diagram

```
 address ──► /api/paradebug/scan ──► last N blocks (batched RPC)
                                          │ txs to the contract
                                          ▼
                              group by block, then by selector
                                          │
                ┌─────────────────────────┼──────────────────────┐
                ▼                         ▼                      ▼
     per-block collisions      per-function counts       AI suggestions
                                 (ABI names if verified)
```

## Consequences

- The tool stops claiming knowledge it does not have.
- Users get a clear list of hot functions to look at.
- The chart, and the most eye-catching part of the current page, goes away.
- No new packages.

## Verification

Unit tests for the grouping with fixed block fixtures: no collisions, one hot function, collisions across many blocks, unverified contract. A manual scan of a busy testnet contract on the preview.
