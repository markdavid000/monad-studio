import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { showAiErrorToast } from "@/lib/ai-toast";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { findingsCount } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { monguardCopy } from "../copy";
import { useScan } from "./use-scan";

const TOAST_ID = "monguard-scan";

export function useMonguard() {
  const draft = useContractDraft();
  const scan = useScan();
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [isResultsOpen, setResultsOpen] = useState(false);

  const findings = scan.report?.findings ?? [];
  const activeId = openId === undefined ? (findings[0]?.id ?? null) : openId;
  const active = findings.find((finding) => finding.id === activeId) ?? null;

  function run() {
    setOpenId(undefined);
    setResultsOpen(false);
    toast.loading(monguardCopy.pendingTitle, {
      id: TOAST_ID,
      description: monguardCopy.pendingBody,
    });
    scan.scan(draft.source, {
      onSuccess: (report) => {
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
    report: scan.report,
    scannedSource: scan.scannedSource ?? draft.source,
    isStale: scan.status === "success" && scan.scannedSource !== draft.source,
    activeId,
    highlightedLines: active?.lines ?? [],
    isResultsOpen,
    setResultsOpen,
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    run,
  };
}
