import type { ApiErrorCode } from "./api-error";

export const aiCopy = {
  note: "AI analysis, not an audit. Check each finding before you rely on it.",
  retry: "Try again",
  errors: {
    invalid_input: "The contract could not be sent. Check that it is not empty and under 60 KB.",
    rate_limited: "You have used 20 AI requests in 10 minutes across the studio tools.",
    upstream_unavailable: "The AI service did not respond. Try again in a moment.",
    invalid_reply: "The AI reply was incomplete, so nothing is shown. Try again.",
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
