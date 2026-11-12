import { Fuel, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { AiErrorState } from "@/components/ui/ai-error-state";
import { findingsCount } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import type { GasReport } from "../types";
import { CheckSection } from "./check-section";
import { OptimizationItem } from "./optimization-item";

interface ResultPanelProps {
  status: "idle" | "pending" | "success" | "error";
  report: GasReport | undefined;
  error: Error | null;
  isStale: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
  onRun: () => void;
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label={gaslensCopy.findingsLabel}
      aria-live="polite"
      className="flex min-w-0 flex-col gap-5 rounded-xl border bg-card p-5"
    >
      {children}
    </section>
  );
}

function Report(props: ResultPanelProps & { report: GasReport }) {
  const { report } = props;
  return (
    <>
      <div className="flex flex-col gap-1 border-b pb-5">
        <p className="font-mono text-sm">{report.contractName}</p>
        <p className="text-sm text-muted-foreground">
          {findingsCount(report.optimizations.length)}
        </p>
      </div>
      <p className="leading-relaxed">{report.summary}</p>
      {props.isStale ? (
        <p className="rounded-lg border border-severity-medium/40 bg-severity-medium/10 px-3 py-2 text-sm">
          {gaslensCopy.stale}
        </p>
      ) : null}
      {report.optimizations.length > 0 ? (
        <CheckSection check={report.check} activeId={props.activeId} onToggle={props.onToggle} />
      ) : null}
      {report.optimizations.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <Fuel aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{gaslensCopy.noFindingsTitle}</p>
            <p className="text-sm text-muted-foreground">{gaslensCopy.noFindingsBody}</p>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {report.optimizations.map((item) => (
              <OptimizationItem
                key={item.id}
                item={item}
                isOpen={item.id === props.activeId}
                onToggle={() => props.onToggle(item.id)}
              />
            ))}
          </ul>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>{gaslensCopy.estimateNote}</p>
            <p>{gaslensCopy.reviewNote}</p>
          </div>
        </>
      )}
    </>
  );
}

export function ResultPanel(props: ResultPanelProps) {
  if (props.status === "pending") {
    return (
      <Panel>
        <div className="flex items-center gap-3">
          <LoaderCircle aria-hidden className="size-5 animate-spin text-eyebrow" />
          <div>
            <p className="font-medium">{gaslensCopy.pendingTitle}</p>
            <p className="text-sm text-muted-foreground">{gaslensCopy.pendingBody}</p>
          </div>
        </div>
        <div aria-hidden className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-11 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </Panel>
    );
  }
  if (props.status === "error") {
    return (
      <Panel>
        <AiErrorState error={props.error} onRetry={props.onRun} />
      </Panel>
    );
  }
  if (props.status === "success" && props.report) {
    return (
      <Panel>
        <Report {...props} report={props.report} />
      </Panel>
    );
  }
  return null;
}
