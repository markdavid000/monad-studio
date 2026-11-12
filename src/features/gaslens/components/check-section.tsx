import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { flaggedTitle, gaslensCopy, rewriteLinesLabel } from "../copy";
import type { RewriteCheck } from "../types";

interface CheckSectionProps {
  check: RewriteCheck;
  activeId: string | null;
  onToggle: (id: string) => void;
}

const TONES = {
  clear: "border-success/40 bg-success/5",
  flagged: "border-severity-critical/50 bg-severity-critical/5",
  unavailable: "border-severity-medium/40 bg-severity-medium/10",
} satisfies Record<RewriteCheck["status"], string>;

function Header({ check }: { check: RewriteCheck }) {
  if (check.status === "clear") {
    return (
      <div className="flex items-start gap-3">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">{gaslensCopy.check.clearTitle}</p>
          <p className="text-sm text-muted-foreground">{gaslensCopy.check.clearBody}</p>
        </div>
      </div>
    );
  }
  if (check.status === "unavailable") {
    return (
      <div className="flex items-start gap-3">
        <ShieldQuestion aria-hidden className="mt-0.5 size-5 shrink-0 text-severity-medium" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">{gaslensCopy.check.unavailableTitle}</p>
          <p className="text-sm text-muted-foreground">{gaslensCopy.check.unavailableBody}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <ShieldAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-severity-critical" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{flaggedTitle(check.risks.length)}</p>
        <p className="text-sm text-muted-foreground">{gaslensCopy.check.flaggedBody}</p>
      </div>
    </div>
  );
}

export function CheckSection({ check, activeId, onToggle }: CheckSectionProps) {
  return (
    <section
      aria-label={gaslensCopy.check.label}
      className={cn("flex flex-col gap-3 rounded-lg border p-4", TONES[check.status])}
    >
      <Header check={check} />
      {check.risks.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {check.risks.map((risk) => (
            <li key={risk.id}>
              <button
                type="button"
                aria-pressed={risk.id === activeId}
                onClick={() => onToggle(risk.id)}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/40",
                  risk.id === activeId
                    ? "border-severity-critical/50 bg-muted/30"
                    : "border-transparent"
                )}
              >
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono font-medium">{risk.functionName}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {rewriteLinesLabel(risk.lines)}
                  </span>
                </span>
                <span className="leading-relaxed text-muted-foreground">{risk.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
