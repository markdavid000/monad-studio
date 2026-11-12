import type { Severity } from "@/lib/severity";
import { cn } from "@/lib/utils";
import { monguardCopy } from "../copy";

const TONES: Record<Severity, string> = {
  critical: "text-severity-critical border-severity-critical/40 bg-severity-critical/10",
  high: "text-severity-high border-severity-high/40 bg-severity-high/10",
  medium: "text-severity-medium border-severity-medium/40 bg-severity-medium/10",
  low: "text-severity-low border-severity-low/40 bg-severity-low/10",
  info: "text-muted-foreground border-border bg-muted/40",
};

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-16 shrink-0 items-center justify-center rounded-full border py-0.5 font-mono text-[11px]",
        TONES[severity]
      )}
    >
      {monguardCopy.severity[severity]}
    </span>
  );
}
