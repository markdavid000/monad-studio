import { ArrowLeft } from "lucide-react";
import { fixSummary, monguardCopy } from "../copy";
import type { FixResult, ScanReport } from "../types";

interface FixPanelProps {
  report: ScanReport;
  fix: FixResult;
  onBack: () => void;
}

const copy = monguardCopy.fixes;

export function FixPanel({ report, fix, onBack }: FixPanelProps) {
  const titleOf = (id: string) => report.findings.find((finding) => finding.id === id)?.title ?? id;

  return (
    <section aria-label={copy.label} className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-1 border-b pb-5">
        <p className="font-mono text-sm">{report.contractName}</p>
        <p className="text-sm text-muted-foreground">
          {fixSummary(fix.applied.length, fix.skipped.length)}
        </p>
      </div>
      {fix.applied.length === 0 ? (
        <p className="rounded-lg border border-severity-medium/40 bg-severity-medium/10 px-3 py-2 text-sm">
          {copy.noChange}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {copy.applied}
          </h3>
          <ul className="flex flex-col gap-2">
            {fix.applied.map((item) => (
              <li key={item.id} className="flex flex-col gap-0.5 rounded-lg border px-3 py-2">
                <span className="text-sm font-medium">{titleOf(item.id)}</span>
                <span className="text-sm text-muted-foreground">{item.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {fix.skipped.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {copy.skipped}
          </h3>
          <ul className="flex flex-col gap-2">
            {fix.skipped.map((item) => (
              <li key={item.id} className="flex flex-col gap-0.5 rounded-lg border px-3 py-2">
                <span className="text-sm font-medium">{titleOf(item.id)}</span>
                <span className="text-sm text-muted-foreground">
                  {item.reason || copy.noReason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {copy.back}
      </button>
    </section>
  );
}
