---
date: 2026-11-12
branch: feat/studio-workspace
base: dev
scenario-impact: needs_automation
---

# The studio opens on a workspace

"Open the studio" now lands on a workspace instead of a list of links. Paste a contract or load one of three examples into an editor with line numbers and a 60 KB meter; the draft stays in this browser and will follow you into each tool. A wider sidebar lists the tools (marked Soon until each one ships) and, at its foot, shows the live Monad testnet block number and your wallet status, so the workspace takes the rest of the screen.

## Changes

- Studio shell: slim top bar (brand, Studio, wallet button, theme), a sticky 20rem left sidebar on large screens holding the tool list and the network and wallet cards; on small screens the tools become a scrolling strip and the cards move below the workspace.
- `features/studio`: workspace, source editor, example picker, next-step actions (Scan, Optimise gas, Deploy, each marked Coming next), and a status rail.
- `useContractDraft`: the draft lives in `localStorage` through `useSyncExternalStore`, shared across tabs.
- `useNetworkStatus`: the latest block from Monad testnet through wagmi's `useBlockNumber` (watching), with loading and error states, and the account state.

## Removed

- The studio tool list page, `ToolList`, its test, and the `isLinked` helper and `LinkedTool` type it used.

## Verification

- Tests: example loads and persists, a saved draft is restored, clear, the 60 KB warning, actions are disabled and labelled, sidebar links only existing tools, status rail live, loading, error, connected.
- Headless Chrome at 1440px and 600px against the dev server; the block number read live from testnet.
