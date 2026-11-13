---
date: 2026-11-13
branch: feat/contract-journey
base: dev
scenario-impact: needs_automation
---

# Move a contract from tool to tool

Every results layer now ends with a **Next step** bar: on the left the state of the contract, on the right what you can do with it, always in the same order.

- **MonGuard** applies its own suggested fixes. Each finding with a fix has a checkbox (all ticked to start). Review fixes sends the chosen ones to a new route, `/api/monguard/fix`, which returns the whole contract with them applied. The layer then shows the changes as a diff, what was applied and what was left out and why. Accept fixes puts the fixed contract in the workspace. Nothing changes before that.
- **GasLens** can accept its rewrite into the workspace, but only when the behaviour check is clear. A flagged rewrite or one whose check did not run cannot be accepted, and the bar says why.
- **MonadForge**: the written contract can be used in the workspace, scanned in MonGuard, reviewed in GasLens, or compiled straight away (the layer closes and the compile runs). Compile results can go to MonGuard or GasLens.
- **MonadForge suggests fixes for compiler errors.** When a compile fails, Suggest fixes calls `/api/forge/fix`, which compiles the contract on the server for the real errors, asks the AI for a corrected file and compiles that too. The layer shows the diff, each change with its line, and whether it now compiles or which errors are left. Accept and compile puts it in the workspace (with Undo) and compiles it.
- **Sending** puts the contract in the workspace (the accepted version if you accepted one), opens the tool and starts its run, so one press does it.
- **Accepting** can be undone from the toast for ten seconds.
- A fix run is saved to Activity as a MonGuard run and reopens with its diff.

## Limits

Each step is one AI request, so a full journey uses three or four of the 20 per 10 minutes, and big contracts can hit Groq's free tier per minute limit. While a results layer is open, toasts (including Undo) are reachable with the mouse but hidden from screen readers by the layer; that was already true of every toast shown over a layer.

## Verification

- Route tests for the fix route; component tests for every bar, accept and undo, sends and the run that starts on arrival.
- Used on port 3000 with a signed in wallet: VulnerableBank scanned, fixes reviewed and accepted, sent to GasLens, rewrite accepted, sent to MonadForge and compiled; Activity lists each step.
