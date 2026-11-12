---
date: 2026-11-12
branch: fix/tool-layout
base: dev
scenario-impact: none
---

# Tool pages use the full width, with the action under the code

MonGuard and GasLens no longer split the page in two. The contract spans the full width, the scan or review button sits right under it, and results appear below once there are any. The description under each page title moved into an info icon next to the title that opens on hover, click or keyboard.

## Changes

- `components/ui/page-title.tsx` with `hooks/use-hover-popover.ts`: title plus an info button that opens a Radix popover on mouse hover, click, tap or Enter. Used by MonGuard, GasLens and the workspace.
- `components/ui/tool-actions.tsx`: the run button with the AI note beside it, or the 60 KB message with a link back to the workspace.
- The run button changes to "Scanning" or "Reviewing" and is disabled while a request runs, then reads "Scan again" or "Review again".
- The out of date notice is now text only, since the button under the code reruns.

## Removed

- The "Ready to scan" and "Ready to review gas" cards and their copy.
- The rerun buttons inside the out of date notices, and the fixed minimum height of the result panels.

## Verification

- Tests: the popover shows the description, no result card before a run, the button state while pending and after.
- Checked MonGuard and GasLens in Chrome at 1440px and 390px with a GasLens result, and hovered the info icon.
