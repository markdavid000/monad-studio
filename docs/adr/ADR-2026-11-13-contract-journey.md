# ADR-2026-11-13: Contract journey between tools

- **Status:** Accepted
- **Approved by:** (MarkDavid, 13th Nov 2026)
- **Companion:** [ADR-2026-11-13-contract-journey-for-dummies.md](ADR-2026-11-13-contract-journey-for-dummies.md)

## Context

The three tools share one contract through the workspace draft (`hooks/use-contract-draft.ts`), but nothing in a result moves the contract on. After a MonGuard scan the user reads each finding's `fixCode` snippet and edits the workspace by hand; after a GasLens review they copy the rewrite; after MonadForge writes a contract they press Use in workspace and then open another tool themselves. The owner wants a journey: accept what a tool suggests after checking it, then send the contract to the next tool, in either direction, from buttons that sit in the same place in every results layer.

Facts that shape the decision:

- A MonGuard finding has `fix` (prose) and `fixCode` (a snippet for that finding), not a corrected contract. Snippets cannot be spliced in reliably: they are partial, may overlap, and their line numbers drift after the first edit. Applying fixes needs a whole corrected contract.
- GasLens already returns a whole rewrite and a second AI pass that marks behaviour changes (`check.status` clear, flagged or unavailable). On 2026-11-12 the owner chose to remove one-click "Use in workspace" from GasLens because a rewrite can change behaviour. This ADR proposes bringing an accept step back under conditions.
- Groq's free tier allows 8,000 tokens a minute. A fix pass on a 60 KB contract is a large request.
- Every tool reads the workspace, and every run is saved to Activity, so a journey leaves a trail of runs the user can reopen.

## Options considered

### A. Send only, no accept

Each results layer gets "send to" buttons that load the contract the tool looked at into the workspace and open the next tool. No fix is ever applied by the studio; the user edits by hand.

Cheap and safe, but it does not do what the owner asked: the suggested fixes and the rewrite still have to be copied by hand.

### B. Accept after review, then send (proposed)

Each tool's results layer gets a fixed **Next step** bar, and MonGuard and GasLens gain an accept step that always shows a diff first.

- **MonGuard:** findings with a fix get a checkbox (all ticked by default). "Review fixes" sends the contract, the chosen findings and their fixes to a new route, `/api/monguard/fix`, which returns the whole contract with those fixes applied. The layer switches to a diff of the fixed contract against the scanned one (the GasLens diff view, moved to shared code). "Accept fixes" puts the fixed contract in the workspace. Nothing changes until that button is pressed.
- **GasLens:** "Accept rewrite" puts the rewrite in the workspace after the diff, and only when the behaviour check is clear. Flagged: the button is off and says why. Unavailable: the button is off until the user reviews again.
- **MonadForge, written contract:** next steps are Scan in MonGuard, Review gas in GasLens and Compile. Each puts the written contract in the workspace. Compile also closes the layer and starts the compile on the MonadForge page.
- **MonadForge, compile results:** next steps are Scan in MonGuard and Review gas in GasLens, and Deploy once step 6 lands.
- **Sending:** puts the contract in the workspace (the accepted version if one was accepted, otherwise the one the tool looked at), closes the layer, opens the next tool and starts its run, so the user does not press a second button. The arriving run shows the usual loading toast.

### C. Automatic pipeline

One button runs MonGuard, applies every fix, runs GasLens, accepts the rewrite and compiles. Fastest, but it applies AI edits nobody has read, burns three or four AI calls per press against the 8,000 token a minute limit, and hides which step changed what. Rejected.

## Decision

Option B.

### Next step bar

A bar fixed to the bottom of the results layer, full width, in every tool: on the left, the state of the contract ("Scanned contract", "Fixes accepted", "Rewrite accepted", "Written contract"); on the right, an accept button where the tool has one, then the send buttons in a fixed order (MonGuard, GasLens, MonadForge compile), leaving out the tool you are in. It lives in `components/ui/next-step-bar.tsx`; each tool passes its own buttons, so no feature imports another. Sending goes through a new shared hook, `hooks/use-send-contract.ts`: it loads the draft, then navigates to `/studio/<tool>?run=new`, which the receiving tool reads as "start a run on the workspace contract" and then removes from the URL.

### MonGuard fix route

`POST /api/monguard/fix` with `{ source, findings: [{ id, title, fix, fixCode, lines }] }` (1 to 20 findings, source up to 60 KB), on the AI limit, `maxDuration` 120. One Groq call with a strict schema returns `{ fixedSource, applied: [{ id, note }], skipped: [{ id, reason }] }`; the reply is mapped like the GasLens rewrite (fences stripped, a fixed source identical to the input counts as nothing applied). The diff and the skipped list are shown before Accept fixes. A fix run is saved to Activity as a MonGuard run with `kind: "fix"`.

### Accepting

Accepting replaces the workspace contract. The previous draft is kept for one step: a toast offers Undo for ten seconds. The accepted contract keeps the file name.

### Amendment: fixes for compiler errors (requested by MarkDavid, 13 Nov 2026)

When a MonadForge compile fails, the compile results bar offers **Suggest fixes**. `POST /api/forge/fix` takes `{ fileName, source }` (the compile input), compiles it on the server to get the real errors (so a client cannot send made up ones), and only then asks Groq for the whole file with those errors fixed (`{ fixedSource, changes: [{ line, note }] }`, strict schema, AI limit, `maxDuration` 60). The suggestion is compiled again and returned with its compile result. The layer shows a diff, each change with its line, and whether it now compiles or which errors remain. **Accept and compile** puts it in the workspace (with Undo) and compiles it. If the contract already compiles, no AI call is made. Suggestions are not saved to Activity; the compile that follows is.

## Diagram

```
 MonadForge (written) ──► Scan ──────────────┐
        │                                    ▼
        ├────► Review gas ──────────► GasLens ◄──── send ──── MonGuard
        │                              │  accept rewrite        │ review fixes ─► /api/monguard/fix
        └────► Compile ◄──── send ─────┘  (check clear only)    │ accept fixes (after diff)
                 │                                              │
                 └────────────── send ◄─────────────────────────┘
 every send: draft.load(contract) ─► /studio/<tool>?run=new ─► run starts ─► saved to Activity
```

## Consequences

- The user can go scan → fix → optimise → compile without copying anything, and every step is a saved run.
- No AI edit reaches the workspace without a diff on screen and a deliberate press, and a flagged or unchecked GasLens rewrite can never be accepted.
- One new AI route (MonGuard fix). A full journey on a large contract uses three or four AI calls, which can hit the 20 per 10 minutes limit and the per-minute token limit sooner; the busy and limit messages already exist.
- The diff code and the diff view move from `features/gaslens` to `lib/diff.ts` and `components/ui/diff-view.tsx`, since MonGuard needs them too.
- Sending starts a run on arrival, so an accidental press spends an AI request. The send buttons name the tool and the action ("Scan in MonGuard") to make that clear.
- No new packages, no new environment variables, no data model change beyond the new `kind: "fix"` MonGuard run.
- Deploy joins the bar when step 6 lands.

## Verification

- Route tests for `/api/monguard/fix`: applied, partly skipped, nothing applied, invalid reply, limit.
- Component tests: the accept buttons only appear after a diff; GasLens accept is off when the check is flagged or unavailable; accepting changes the draft and Undo restores it; each send loads the draft, opens the right tool and starts one run; the bar shows the same buttons in the same order in every tool.
- Manual: VulnerableBank from MonGuard, accept fixes, send to GasLens, accept the rewrite, send to MonadForge and compile, then check Activity lists each step.
