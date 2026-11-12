import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { showAiErrorToast } from "@/lib/ai-toast";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { flaggedTitle, gaslensCopy } from "../copy";
import { diffLines, diffLineKey, type DiffLine } from "../lib/diff";
import type { GasReport } from "../types";
import { useGasAnalysis } from "./use-gas-analysis";

type CodeMode = "source" | "changes";

const TOAST_ID = "gaslens-review";

function showDoneToast(report: GasReport) {
  const description = findingsCount(report.optimizations.length);
  if (report.check.status === "flagged") {
    toast.warning(gaslensCopy.doneTitle, {
      id: TOAST_ID,
      description: `${description}. ${flaggedTitle(report.check.risks.length)}.`,
    });
  } else if (report.check.status === "unavailable") {
    toast.warning(gaslensCopy.doneTitle, {
      id: TOAST_ID,
      description: `${description}. ${gaslensCopy.check.unavailableTitle}.`,
    });
  } else {
    toast.success(gaslensCopy.doneTitle, { id: TOAST_ID, description });
  }
}

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
  const [isResultsOpen, setResultsOpen] = useState(false);

  const report = analysis.status === "success" ? analysis.report : undefined;
  const reviewedSource = report ? (analysis.analysedSource ?? draft.source) : draft.source;
  const risks = report?.check.risks ?? [];
  const activeId = openId === undefined ? defaultFocus(report) : openId;
  const activeOptimization = report?.optimizations.find((item) => item.id === activeId);
  const activeRisk = risks.find((risk) => risk.id === activeId);
  const diff = report ? diffLines(reviewedSource, report.optimizedSource) : [];
  const hasChanges = diff.some((line) => line.kind !== "same");
  function run() {
    setOpenId(undefined);
    setChosenMode(undefined);
    setResultsOpen(false);
    toast.loading(gaslensCopy.pendingTitle, { id: TOAST_ID, description: gaslensCopy.pendingBody });
    analysis.analyse(draft.source, {
      onSuccess: (next) => {
        showDoneToast(next);
        setResultsOpen(true);
      },
      onError: (error) => {
        showAiErrorToast(error, { id: TOAST_ID, title: gaslensCopy.failedTitle, onRetry: run });
      },
    });
  }

  const mode: CodeMode =
    report && hasChanges ? (activeRisk ? "changes" : (chosenMode ?? "changes")) : "source";

  return {
    fileName: draft.name,
    draftSource: draft.source,
    source: reviewedSource,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: analysis.status === "pending",
    report: analysis.report,
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
    isResultsOpen,
    setResultsOpen,
    run,
  };
}
