import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { diffLines, diffLineKey, type DiffLine } from "../lib/diff";
import type { GasReport } from "../types";
import { useGasAnalysis } from "./use-gas-analysis";

type CodeMode = "source" | "changes";

function rewriteKeys(diff: readonly DiffLine[], lines: readonly number[]) {
  const wanted = new Set(lines);
  return diff
    .filter((line) => line.newNumber !== undefined && wanted.has(line.newNumber))
    .map(diffLineKey);
}

function defaultFocus(report: GasReport | undefined) {
  return report?.check.risks[0]?.id ?? report?.optimizations[0]?.id ?? null;
}

export function useGaslens() {
  const draft = useContractDraft();
  const analysis = useGasAnalysis();
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [chosenMode, setChosenMode] = useState<CodeMode | undefined>(undefined);

  const report = analysis.status === "success" ? analysis.report : undefined;
  const reviewedSource = report ? (analysis.analysedSource ?? draft.source) : draft.source;
  const risks = report?.check.risks ?? [];
  const activeId = openId === undefined ? defaultFocus(report) : openId;
  const activeOptimization = report?.optimizations.find((item) => item.id === activeId);
  const activeRisk = risks.find((risk) => risk.id === activeId);
  const diff = report ? diffLines(reviewedSource, report.optimizedSource) : [];
  const hasChanges = diff.some((line) => line.kind !== "same");
  const mode: CodeMode =
    report && hasChanges ? (activeRisk ? "changes" : (chosenMode ?? "changes")) : "source";

  return {
    fileName: draft.name,
    source: reviewedSource,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    status: analysis.status,
    report: analysis.report,
    error: analysis.error,
    diff,
    hasChanges,
    mode,
    isStale: report !== undefined && draft.source !== reviewedSource,
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
    run: () => {
      setOpenId(undefined);
      setChosenMode(undefined);
      analysis.analyse(draft.source);
    },
  };
}
