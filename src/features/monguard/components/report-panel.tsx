import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { findingsCount } from "@/lib/copy";
import { monguardCopy } from "../copy";
import type { ScanReport } from "../types";
import { FindingItem } from "./finding-item";

interface ReportPanelProps {
  report: ScanReport;
  isStale: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
}

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-severity-medium";
  return "text-severity-critical";
}

function Report({ report, isStale, activeId, onToggle }: ReportPanelProps) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{monguardCopy.scoreLabel}</p>
          <p className="font-mono">
            <span className={cn("text-4xl font-medium tabular-nums", scoreTone(report.score))}>
              {report.score}
            </span>
            <span className="text-sm text-muted-foreground">{monguardCopy.outOf}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <p className="font-mono text-sm">{report.contractName}</p>
          <p className="text-sm text-muted-foreground">{findingsCount(report.findings.length)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{monguardCopy.scoreNote}</p>
      <p className="leading-relaxed">{report.summary}</p>
      {isStale ? (
        <p className="rounded-lg border border-severity-medium/40 bg-severity-medium/10 px-3 py-2 text-sm">
          {monguardCopy.stale}
        </p>
      ) : null}
      {report.findings.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{monguardCopy.noFindingsTitle}</p>
            <p className="text-sm text-muted-foreground">{monguardCopy.noFindingsBody}</p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {report.findings.map((finding) => (
            <FindingItem
              key={finding.id}
              finding={finding}
              isOpen={finding.id === activeId}
              onToggle={() => onToggle(finding.id)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export function ReportPanel(props: ReportPanelProps) {
  return (
    <section aria-label={monguardCopy.findingsLabel} className="flex min-w-0 flex-col gap-5">
      <Report {...props} />
    </section>
  );
}
