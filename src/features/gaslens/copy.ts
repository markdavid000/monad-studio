import { findingsCount, linesLabel } from "@/lib/copy";
import type { IMPACTS, SAVING_SCOPES } from "./lib/schema";
import type { GasReport } from "./types";

type Impact = (typeof IMPACTS)[number];
type SavingScope = (typeof SAVING_SCOPES)[number];

export const gaslensCopy = {
  title: "GasLens",
  lead: "A gas review of the contract in your workspace. Each finding estimates what it saves, and the rewritten contract is shown as a diff against yours.",
  codeLabel: "Contract",
  viewSource: "Source",
  viewChanges: "Changes",
  untitled: "Untitled.sol",
  editInWorkspace: "Edit in workspace",
  emptyTitle: "No contract in the workspace yet",
  emptyBody:
    "Paste a contract or load an example in the workspace, then come back here to review its gas.",
  openWorkspace: "Open the workspace",
  tooLarge: "This contract is over the 60 KB limit. Trim it in the workspace before reviewing it.",
  analyse: "Review gas",
  rerun: "Review again",
  analysing: "Reviewing",
  about: "About GasLens",
  checks:
    "It looks for storage reads in loops, memory where calldata will do, string reverts, missing immutables and loop counters, rewrites the contract, then checks the rewrite for behaviour changes.",
  pendingTitle: "Reviewing gas",
  doneTitle: "Review finished",
  failedTitle: "Review failed",
  resultsTitle: "GasLens results",
  showResults: "Show results",
  pendingBody: "This usually takes 15 to 60 seconds, longer for big contracts.",
  stale: "The contract changed since this review. Review again to update it.",
  reviewNote:
    "Read every change before you copy the rewrite, then run MonGuard on it before you deploy. A rewrite can change behaviour even when it looks like a pure gas fix.",
  check: {
    label: "Behaviour check",
    clearTitle: "No behaviour change found",
    clearBody:
      "A second AI pass compared the rewrite with your contract and found no function that behaves differently. It is not a proof, so still read the diff.",
    flaggedBody:
      "A second AI pass compared the rewrite with your contract. These parts may behave differently, so do not use the rewrite as it is. The flagged lines are marked in the diff.",
    unavailableTitle: "The behaviour check did not run",
    unavailableBody:
      "The AI service did not answer the second pass, so no change in this rewrite has been checked. Review again or read every change yourself.",
  },
  findingsLabel: "Optimisations",
  estimateNote:
    "Savings are the model's estimates for one call, one deployment or one loop iteration, not measured gas.",
  noFindingsTitle: "Nothing to optimise",
  noFindingsBody: "GasLens found no clear gas waste, so the contract is unchanged.",
  copyOptimised: "Copy optimised contract",
  journey: {
    accept: "Accept rewrite",
    acceptedTitle: "Rewrite accepted into the workspace",
    statusReviewed: "Reviewed contract",
    statusReady: "Rewrite checked, not accepted yet",
    statusAccepted: "Rewrite accepted into the workspace",
    statusUnchanged: "Nothing to rewrite",
    readyNote: "Check every change on the left before you accept.",
    flaggedNote: "The behaviour check flagged this rewrite, so it cannot be accepted.",
    unavailableNote: "The behaviour check did not run. Review again before accepting the rewrite.",
  },
  copied: "Copied",
  impact: { high: "High", medium: "Medium", low: "Low" } satisfies Record<Impact, string>,
  per: {
    call: "per call",
    deployment: "on deployment",
    iteration: "per loop iteration",
  } satisfies Record<SavingScope, string>,
  intro: {
    title: "GasLens: gas review",
    body: "GasLens finds gas waste in the contract in your workspace and rewrites it.",
    points: [
      {
        title: "Review",
        body: "Press Review gas under the code. A review usually takes 15 to 60 seconds.",
      },
      {
        title: "Compare the rewrite",
        body: "Each optimisation shows its estimated saving, and the rewritten contract is shown as a diff against yours.",
      },
      {
        title: "Watch for flagged changes",
        body: "A second check marks any change that may alter behaviour. Read every change before you copy the rewrite.",
      },
    ],
    done: "Got it",
  },
} as const;

export function savingLabel(gas: number, per: SavingScope) {
  return `About ${gas.toLocaleString("en-US")} gas ${gaslensCopy.per[per]}`;
}

export function changeSummary(added: number, removed: number) {
  return `${added} added, ${removed} removed`;
}

export function flaggedTitle(count: number) {
  return count === 1 ? "1 change may alter behaviour" : `${count} changes may alter behaviour`;
}

export function rewriteLinesLabel(lines: readonly number[]) {
  const label = linesLabel(lines);
  return label ? `${label} of the rewrite` : "";
}

export function runSummary(report: GasReport) {
  const findings = findingsCount(report.optimizations.length);
  const flagged = report.check.risks.length;
  return flagged > 0 ? `${findings}, ${flagged} flagged` : findings;
}

export const gaslensDemoCopy = {
  lead: "A gas review of a Solidity contract. It lists savings line by line and shows a rewritten contract as a diff.",
  pick: "Pick an example contract",
  run: "See the review",
  note: "Recorded from a real GasLens review of this example. Nothing is sent when you press it.",
} as const;
