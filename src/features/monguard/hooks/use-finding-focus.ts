import { useState } from "react";
import type { ScanReport } from "../types";

export function useFindingFocus(report: ScanReport | undefined) {
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const findings = report?.findings ?? [];
  const activeId = openId === undefined ? (findings[0]?.id ?? null) : openId;
  const active = findings.find((finding) => finding.id === activeId) ?? null;

  return {
    activeId,
    highlightedLines: active?.lines ?? [],
    toggle: (id: string) => setOpenId(activeId === id ? null : id),
    reset: () => setOpenId(undefined),
  };
}
