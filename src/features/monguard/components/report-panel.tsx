import { LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { findingsCount, monguardCopy, retryIn } from "../copy";
import type { ScanReport } from "../types";
import { FindingItem } from "./finding-item";

interface ReportPanelProps {
  status: "idle" | "pending" | "success" | "error";
  report: ScanReport | undefined;
  error: Error | null;
  isTooLarge: boolean;
  isStale: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
  onScan: () => void;
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label={monguardCopy.findingsLabel}
      aria-live="polite"
      className="flex min-h-[24rem] min-w-0 flex-col gap-5 rounded-xl border bg-card p-5"
    >
      {children}
    </section>
  );
}

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-severity-medium";
  return "text-severity-critical";
}

function ErrorState({ error, onScan }: { error: Error | null; onScan: () => void }) {
  const code = error instanceof ApiError ? error.code : "internal";
  const retryAfter = error instanceof ApiError ? error.retryAfterSeconds : undefined;
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-4">
      <div role="alert" className="flex flex-col gap-1">
        <p className="font-medium">{monguardCopy.errors[code]}</p>
        {code === "rate_limited" && retryAfter ? (
          <p className="text-sm text-muted-foreground">{retryIn(retryAfter)}</p>
        ) : null}
      </div>
      {code === "rate_limited" ? null : (
        <Button variant="outline" onClick={onScan}>
          <RotateCcw aria-hidden />
          {monguardCopy.retry}
        </Button>
      )}
    </div>
  );
}

function PendingState() {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-3">
        <LoaderCircle aria-hidden className="size-5 animate-spin text-eyebrow" />
        <div>
          <p className="font-medium">{monguardCopy.pendingTitle}</p>
          <p className="text-sm text-muted-foreground">{monguardCopy.pendingBody}</p>
        </div>
      </div>
      <div aria-hidden className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-11 animate-pulse rounded-lg bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

function Report({
  report,
  isStale,
  activeId,
  onToggle,
  onScan,
}: Required<Pick<ReportPanelProps, "isStale" | "activeId" | "onToggle" | "onScan">> & {
  report: ScanReport;
}) {
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-severity-medium/40 bg-severity-medium/10 px-3 py-2 text-sm">
          <span>{monguardCopy.stale}</span>
          <Button size="sm" variant="outline" onClick={onScan}>
            {monguardCopy.rescan}
          </Button>
        </div>
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
  const { status, report, error, isTooLarge, onScan } = props;

  if (isTooLarge) {
    return (
      <Panel>
        <div className="flex flex-1 flex-col items-start justify-center gap-4">
          <p role="alert">{monguardCopy.tooLarge}</p>
          <Button asChild variant="outline">
            <Link href="/studio">{monguardCopy.editInWorkspace}</Link>
          </Button>
        </div>
      </Panel>
    );
  }
  if (status === "pending") {
    return (
      <Panel>
        <PendingState />
      </Panel>
    );
  }
  if (status === "error") {
    return (
      <Panel>
        <ErrorState error={error} onScan={onScan} />
      </Panel>
    );
  }
  if (status === "success" && report) {
    return (
      <Panel>
        <Report
          report={report}
          isStale={props.isStale}
          activeId={props.activeId}
          onToggle={props.onToggle}
          onScan={onScan}
        />
      </Panel>
    );
  }
  return (
    <Panel>
      <div className="flex flex-1 flex-col items-start justify-center gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-medium">{monguardCopy.idleTitle}</p>
          <p className="max-w-md text-muted-foreground">{monguardCopy.idleBody}</p>
        </div>
        <Button size="lg" onClick={onScan}>
          <ShieldCheck aria-hidden />
          {monguardCopy.scan}
        </Button>
      </div>
    </Panel>
  );
}
