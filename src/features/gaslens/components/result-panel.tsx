import { Fuel } from "lucide-react";
import { findingsCount } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import type { GasReport } from "../types";
import { CheckSection } from "./check-section";
import { OptimizationItem } from "./optimization-item";

interface ResultPanelProps {
  report: GasReport;
  isStale: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
}

function Report(props: ResultPanelProps) {
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
  return (
    <section aria-label={gaslensCopy.findingsLabel} className="flex min-w-0 flex-col gap-5">
      <Report {...props} />
    </section>
  );
}
