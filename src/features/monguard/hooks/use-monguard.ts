import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { useRecordRun, useSavedRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { monguardCopy, runSummary } from "../copy";
import { scanReportSchema } from "../lib/schema";
import { useScan } from "./use-scan";

const TOAST_ID = "monguard-scan";

export function useMonguard(runId?: string) {
  const draft = useContractDraft();
  const scan = useScan();
  const saved = useSavedRun("monguard", runId, scanReportSchema);
  const recordRun = useRecordRun("monguard");
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [isResultsOpen, setResultsOpen] = useState(runId !== undefined);

  const isFresh = scan.status !== "idle";
  const report = isFresh ? scan.report : saved.report;
  const reportSource = (isFresh ? scan.scannedSource : saved.source) ?? draft.source;
  const findings = report?.findings ?? [];
  const activeId = openId === undefined ? (findings[0]?.id ?? null) : openId;
  const active = findings.find((finding) => finding.id === activeId) ?? null;

  function run() {
    setOpenId(undefined);
    setResultsOpen(false);
    toast.loading(monguardCopy.pendingTitle, {
      id: TOAST_ID,
      description: monguardCopy.pendingBody,
    });
    const source = draft.source;
    scan.scan(source, {
      onSuccess: (report) => {
        recordRun({
          fileName: draft.name || monguardCopy.untitled,
          contractName: report.contractName,
          summary: runSummary(report),
          source,
          report,
        });
        toast.success(monguardCopy.doneTitle, {
          id: TOAST_ID,
          description: findingsCount(report.findings.length),
        });
        setResultsOpen(true);
      },
      onError: (error) => {
        showAiErrorToast(error, { id: TOAST_ID, title: monguardCopy.failedTitle, onRetry: run });
      },
    });
  }

  return {
    fileName: draft.name,
    source: draft.source,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    isPending: scan.status === "pending",
    report,
    scannedSource: reportSource,
    isMissing: saved.isMissing && !isFresh,
    isStale: report !== undefined && reportSource !== draft.source,
    activeId,
    highlightedLines: active?.lines ?? [],
    isResultsOpen,
    setResultsOpen,
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    run,
  };
}
