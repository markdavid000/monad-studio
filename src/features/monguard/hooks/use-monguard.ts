import { useState } from "react";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { useScan } from "./use-scan";

export function useMonguard() {
  const draft = useContractDraft();
  const scan = useScan();
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);

  const findings = scan.report?.findings ?? [];
  const activeId = openId === undefined ? (findings[0]?.id ?? null) : openId;
  const active = findings.find((finding) => finding.id === activeId) ?? null;

  return {
    fileName: draft.name,
    source: draft.source,
    isEmpty: draft.source.trim().length === 0,
    isTooLarge: byteSize(draft.source) > SOURCE_LIMIT_BYTES,
    status: scan.status,
    report: scan.report,
    error: scan.error,
    isStale: scan.status === "success" && scan.scannedSource !== draft.source,
    activeId,
    highlightedLines: active?.lines ?? [],
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    run: () => {
      setOpenId(undefined);
      scan.scan(draft.source);
    },
  };
}
