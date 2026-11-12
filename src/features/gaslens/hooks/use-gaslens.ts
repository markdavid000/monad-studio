import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { diffLines } from "../lib/diff";
import { useGasAnalysis } from "./use-gas-analysis";

type CodeMode = "source" | "changes";

export function useGaslens() {
  const draft = useContractDraft();
  const analysis = useGasAnalysis();
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [chosenMode, setChosenMode] = useState<CodeMode | undefined>(undefined);

  const report = analysis.status === "success" ? analysis.report : undefined;
  const reviewedSource = report ? (analysis.analysedSource ?? draft.source) : draft.source;
  const optimizations = report?.optimizations ?? [];
  const activeId = openId === undefined ? (optimizations[0]?.id ?? null) : openId;
  const active = optimizations.find((item) => item.id === activeId) ?? null;
  const diff = report ? diffLines(reviewedSource, report.optimizedSource) : [];
  const hasChanges = diff.some((line) => line.kind !== "same");
  const isApplied =
    report !== undefined &&
    hasChanges &&
    draft.source === report.optimizedSource &&
    draft.source !== reviewedSource;

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
    mode: report && hasChanges ? (chosenMode ?? "changes") : "source",
    isApplied,
    isStale: report !== undefined && !isApplied && draft.source !== reviewedSource,
    activeId,
    highlightedLines: active?.lines ?? [],
    setMode: setChosenMode,
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    apply: () => {
      if (report) draft.load(draft.name, report.optimizedSource);
    },
    run: () => {
      setOpenId(undefined);
      setChosenMode(undefined);
      analysis.analyse(draft.source);
    },
  };
}
