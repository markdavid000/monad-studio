export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  content: string;
  lineNumberOriginal: number | null;
  lineNumberOptimized: number | null;
}

// Simple line-by-line diff using LCS (longest common subsequence)
function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function backtrack(
  dp: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number,
  result: DiffLine[],
  lineNumA: { val: number },
  lineNumB: { val: number }
): void {
  if (i === 0 && j === 0) return;

  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    backtrack(dp, a, b, i - 1, j - 1, result, lineNumA, lineNumB);
    result.push({
      type: "unchanged",
      content: a[i - 1],
      lineNumberOriginal: lineNumA.val++,
      lineNumberOptimized: lineNumB.val++,
    });
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    backtrack(dp, a, b, i, j - 1, result, lineNumA, lineNumB);
    result.push({
      type: "added",
      content: b[j - 1],
      lineNumberOriginal: null,
      lineNumberOptimized: lineNumB.val++,
    });
  } else {
    backtrack(dp, a, b, i - 1, j, result, lineNumA, lineNumB);
    result.push({
      type: "removed",
      content: a[i - 1],
      lineNumberOriginal: lineNumA.val++,
      lineNumberOptimized: null,
    });
  }
}

export function computeDiff(original: string, optimized: string): DiffLine[] {
  const aLines = original.split("\n");
  const bLines = optimized.split("\n");

  // For very large contracts, limit to avoid stack overflow from recursion
  // Use a simpler approach for large files
  if (aLines.length > 300 || bLines.length > 300) {
    return simpleDiff(aLines, bLines);
  }

  const dp = lcs(aLines, bLines);
  const result: DiffLine[] = [];
  const lineNumA = { val: 1 };
  const lineNumB = { val: 1 };

  backtrack(
    dp,
    aLines,
    bLines,
    aLines.length,
    bLines.length,
    result,
    lineNumA,
    lineNumB
  );
  return result;
}

// Fallback for large contracts — iterative approach
function simpleDiff(aLines: string[], bLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  const aSet = new Set(aLines);
  const bSet = new Set(bLines);

  let ai = 0;
  let bi = 0;
  let lineNumA = 1;
  let lineNumB = 1;

  while (ai < aLines.length || bi < bLines.length) {
    const aLine = aLines[ai];
    const bLine = bLines[bi];

    if (ai >= aLines.length) {
      result.push({
        type: "added",
        content: bLine,
        lineNumberOriginal: null,
        lineNumberOptimized: lineNumB++,
      });
      bi++;
    } else if (bi >= bLines.length) {
      result.push({
        type: "removed",
        content: aLine,
        lineNumberOriginal: lineNumA++,
        lineNumberOptimized: null,
      });
      ai++;
    } else if (aLine === bLine) {
      result.push({
        type: "unchanged",
        content: aLine,
        lineNumberOriginal: lineNumA++,
        lineNumberOptimized: lineNumB++,
      });
      ai++;
      bi++;
    } else if (!bSet.has(aLine)) {
      result.push({
        type: "removed",
        content: aLine,
        lineNumberOriginal: lineNumA++,
        lineNumberOptimized: null,
      });
      ai++;
    } else if (!aSet.has(bLine)) {
      result.push({
        type: "added",
        content: bLine,
        lineNumberOriginal: null,
        lineNumberOptimized: lineNumB++,
      });
      bi++;
    } else {
      result.push({
        type: "removed",
        content: aLine,
        lineNumberOriginal: lineNumA++,
        lineNumberOptimized: null,
      });
      result.push({
        type: "added",
        content: bLine,
        lineNumberOriginal: null,
        lineNumberOptimized: lineNumB++,
      });
      ai++;
      bi++;
    }
  }

  return result;
}

export function getDiffStats(diff: DiffLine[]) {
  const added = diff.filter((l) => l.type === "added").length;
  const removed = diff.filter((l) => l.type === "removed").length;
  const unchanged = diff.filter((l) => l.type === "unchanged").length;
  return { added, removed, unchanged, total: added + removed + unchanged };
}
