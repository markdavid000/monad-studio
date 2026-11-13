import { useState } from "react";
import { diffLineKey, diffLines, type DiffLine } from "../lib/diff";
import type { GasReport } from "../types";

export type CodeMode = "source" | "changes";

function rewriteKeys(diff: readonly DiffLine[], lines: readonly number[]) {
  const wanted = new Set(lines);
  return diff
    .filter((line) => line.newNumber !== undefined && wanted.has(line.newNumber))
    .map(diffLineKey);
}

function defaultFocus(report: GasReport | undefined) {
  return report?.check.risks[0]?.id ?? report?.optimizations[0]?.id ?? null;
}

export function useGasReportView(report: GasReport | undefined, reviewedSource: string) {
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [chosenMode, setChosenMode] = useState<CodeMode | undefined>(undefined);

  const risks = report?.check.risks ?? [];
  const activeId = openId === undefined ? defaultFocus(report) : openId;
  const activeOptimization = report?.optimizations.find((item) => item.id === activeId);
  const activeRisk = risks.find((risk) => risk.id === activeId);
  const diff = report ? diffLines(reviewedSource, report.optimizedSource) : [];
  const hasChanges = diff.some((line) => line.kind !== "same");
  const mode: CodeMode =
    report && hasChanges ? (activeRisk ? "changes" : (chosenMode ?? "changes")) : "source";

  return {
    diff,
    hasChanges,
    mode,
    activeId,
    highlightedKeys: activeRisk
      ? rewriteKeys(diff, activeRisk.lines)
      : (activeOptimization?.lines.map((line) => `o${line}`) ?? []),
    flaggedKeys: rewriteKeys(
      diff,
      risks.flatMap((risk) => risk.lines)
    ),
    setMode: (next: CodeMode) => {
      if (activeRisk) setOpenId(null);
      setChosenMode(next);
    },
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    reset: () => {
      setOpenId(undefined);
      setChosenMode(undefined);
    },
  };
}
