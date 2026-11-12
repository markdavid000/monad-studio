import { linesLabel } from "@/lib/copy";
import type { IMPACTS, SAVING_SCOPES } from "./lib/schema";

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
  pendingTitle: "Rewriting the contract",
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
  copied: "Copied",
  impact: { high: "High", medium: "Medium", low: "Low" } satisfies Record<Impact, string>,
  per: {
    call: "per call",
    deployment: "on deployment",
    iteration: "per loop iteration",
  } satisfies Record<SavingScope, string>,
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
