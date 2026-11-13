import { ArrowLeft, CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { forgeCopy, lineLabel } from "../copy";
import type { ErrorFix } from "../types";
import { DiagnosticList } from "./diagnostic-list";

interface ErrorFixPanelProps {
  fix: ErrorFix;
  onBack: () => void;
}

const copy = forgeCopy.compile.fixes;

export function ErrorFixPanel({ fix, onBack }: ErrorFixPanelProps) {
  const compiles = fix.compile.status === "compiled";

  return (
    <section aria-label={copy.changesLabel} className="flex min-w-0 flex-col gap-5">
      <p
        className={cn(
          "flex items-center gap-1.5 border-b pb-5 text-sm",
          compiles ? "text-success" : "text-severity-critical"
        )}
      >
        {compiles ? (
          <CircleCheck aria-hidden className="size-4" />
        ) : (
          <CircleAlert aria-hidden className="size-4" />
        )}
        {compiles ? copy.compiles : copy.remainingLabel}
      </p>
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {copy.changesLabel}
        </h3>
        <ul className="flex flex-col gap-2">
          {fix.changes.map((change, index) => (
            <li
              key={`${change.line}-${index}`}
              className="flex flex-col gap-0.5 rounded-lg border px-3 py-2"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {lineLabel(change.line)}
              </span>
              <span className="text-sm">{change.note}</span>
            </li>
          ))}
        </ul>
      </div>
      {fix.compile.status === "failed" ? (
        <DiagnosticList label={copy.remainingLabel} items={fix.compile.errors} />
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
