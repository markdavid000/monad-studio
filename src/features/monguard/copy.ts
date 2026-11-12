import type { ApiErrorCode } from "@/lib/api-error";
import type { Severity } from "@/lib/severity";

export const monguardCopy = {
  title: "MonGuard",
  lead: "A security review of the contract in your workspace. Each finding names the lines involved and suggests a fix.",
  aiNote: "AI analysis, not an audit. Check each finding before you rely on it.",
  sourceLabel: "Contract source",
  untitled: "Untitled.sol",
  editInWorkspace: "Edit in workspace",
  emptyTitle: "No contract in the workspace yet",
  emptyBody:
    "Paste a contract or load an example in the workspace, then come back here to scan it.",
  openWorkspace: "Open the workspace",
  tooLarge: "This contract is over the 60 KB limit. Trim it in the workspace before scanning.",
  scan: "Scan contract",
  rescan: "Scan again",
  scanning: "Scanning",
  idleTitle: "Ready to scan",
  idleBody:
    "MonGuard checks external calls, access control, arithmetic and value flow, then lists what it finds by severity.",
  pendingTitle: "Reading the contract",
  pendingBody: "This usually takes 10 to 40 seconds.",
  stale: "The contract changed since this scan. Scan again to update the findings.",
  scoreLabel: "Security score",
  outOf: "/100",
  scoreNote:
    "Starts at 100 and drops with each finding: critical 25, high 15, medium 8, low 3, info 1.",
  findingsLabel: "Findings",
  noFindingsTitle: "No issues found",
  noFindingsBody:
    "MonGuard found nothing to report. That does not prove the contract is safe, so review it before you deploy.",
  impact: "Why it matters",
  fix: "Suggested fix",
  copyFix: "Copy fix",
  copied: "Copied",
  retry: "Try again",
  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    info: "Info",
  } satisfies Record<Severity, string>,
  errors: {
    invalid_input: "The contract could not be sent. Check that it is not empty and under 60 KB.",
    rate_limited: "You have used 20 scans in 10 minutes.",
    upstream_unavailable: "The AI service did not respond. Try again in a moment.",
    invalid_reply: "The AI reply was incomplete, so nothing is shown. Try the scan again.",
    internal: "Something went wrong on our side. Try again.",
  } satisfies Record<ApiErrorCode, string>,
} as const;

function lineRanges(lines: readonly number[]) {
  const ranges: string[] = [];
  let start = lines[0];
  let previous = lines[0];
  for (const line of [...lines.slice(1), Number.NaN]) {
    if (line === previous + 1) {
      previous = line;
      continue;
    }
    ranges.push(start === previous ? `${start}` : `${start} to ${previous}`);
    start = line;
    previous = line;
  }
  return ranges.join(", ");
}

export function linesLabel(lines: readonly number[]) {
  if (lines.length === 0) return "";
  return `${lines.length === 1 ? "Line" : "Lines"} ${lineRanges(lines)}`;
}

export function findingsCount(count: number) {
  return count === 1 ? "1 finding" : `${count} findings`;
}

export function retryIn(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "Try again in a minute." : `Try again in ${minutes} minutes.`;
}
