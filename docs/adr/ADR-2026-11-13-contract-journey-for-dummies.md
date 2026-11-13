# Moving a contract from tool to tool, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-13-contract-journey.md](ADR-2026-11-13-contract-journey.md)

## What is the problem?

Each tool gives you advice, but you have to act on it yourself. MonGuard suggests fixes you copy in by hand, GasLens shows a cheaper version you copy by hand, and after MonadForge writes a contract you have to open the next tool yourself. It should feel like one journey: check, fix, optimise, compile.

## What are we doing about it?

- **One bar, same place, every tool.** At the bottom of every results panel there is a bar that says what state your contract is in and offers the next steps, always in the same order: MonGuard, GasLens, then MonadForge's Compile.
- **MonGuard can apply its fixes.** You tick the fixes you want (all are ticked to start), press Review fixes, and the AI writes the corrected contract. You see exactly what changed, line by line, before you press Accept fixes. Nothing changes until you do.
- **GasLens can apply its rewrite**, after you have seen the changes, but only when its safety check found no change in behaviour. If the check raised a concern or could not run, the button stays off and says why.
- **MonadForge's written contract** can go straight to MonGuard, to GasLens, or to Compile. Compile closes the panel and starts compiling on the same page.
- **Sending a contract** puts it in your workspace, opens the next tool and starts it for you, so it is one press.
- **Accepting is undoable** for ten seconds, in case you pressed it by mistake.

## What changes for people?

- You can go from a written or pasted contract to a scanned, fixed, optimised and compiled one without copying anything.
- Every step still appears in Activity, so you can go back to any of them.

## What could go wrong?

- Each step is an AI request, so a full journey uses three or four of your 20 requests every 10 minutes, and on our free AI plan big contracts can hit the per-minute limit. The usual "try again in a minute" message covers it.
- An AI fix can still be wrong. That is why you always see the changes first, and why GasLens's rewrite cannot be accepted when its own check is unsure.
