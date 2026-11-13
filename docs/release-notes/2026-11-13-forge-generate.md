---
date: 2026-11-13
branch: feat/forge-generate
base: dev
scenario-impact: needs_automation
---

# MonadForge writes and compiles contracts

The page fits on one screen: two cards side by side, Write a contract and Compile. The Compile card summarises the workspace contract (file, length, pragma, declared contracts) instead of printing the whole source; the code is in the workspace and in the results. Each result opens in the results layer over the page, code on the left and results on the right, with Show contract and Show results to reopen it, and the card shows the last result's status (and whether the workspace changed since the last compile). Progress and errors are toasts.

Every written contract and every compile is saved to Activity as a MonadForge run, with its own filter, and reopens from there without another request.

Across the studio (MonGuard, GasLens and MonadForge):

- A tool keeps its last result for the browser tab. Leave for another page and come back: the Show results button and the result are still there.
- A run started before leaving the page still finishes, is saved to Activity and announces itself in a toast; the tool shows it as running when you come back. Recording now happens in the request itself, not in the page that started it.
- The results layer is wider: the window width less 3 rem on large screens, with no maximum.

`/studio/forge` is open in the studio sidebar and from the workspace's Compile action.

- **Write a contract.** Describe a contract and MonadForge writes one Solidity file with no imports, then compiles it on the server. When the first draft does not compile, the compiler errors go back to the model once for a fix. The result shows its summary, notes to check before deploying, and whether it compiles, with error lines marked. Use in workspace replaces the workspace contract with it; nothing is replaced until that button is pressed.
- **Compile.** The workspace contract is compiled with solc 0.8.38, optimizer on at 200 runs, EVM version prague, exactly as written. The old app rewrote `revert;` and license lines before compiling; this one never changes the source. Success lists each deployable contract with its runtime size, constructor, functions, and buttons to copy the ABI and bytecode. Failure lists each compiler error with a button that highlights its line in the code beside it.
- The compile route returns the exact standard JSON input and full compiler version, ready for deployment and Sourcify verification in the next step.
- Compiling has its own limit (60 per 10 minutes) and does not count against the 20 AI requests.

New dependency: `solc` 0.8.38, pinned, server only.

## Not yet

Deploying from the wallet, verification and recording forge runs in Activity come in the next step.

## Verification

- Route tests run the real compiler: settings, error lines, interfaces only, warnings, input checks and limits. Generate route tests mock Groq.
- Component tests cover generation, loading into the workspace, compile success, errors, stale results, empty and oversized drafts.
- Live on port 3000 with a signed in wallet session: written escrow, piggy bank and capped token contracts all compiled (5 to 9 s each); loading into the workspace, compiling, and a broken pragma reported on its line; no horizontal scroll at 390 px. Before the native MON rule and the repair pass, two of three escrow drafts failed to compile and the model wrapped MON in an ERC20 interface.
