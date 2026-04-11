import { cn } from "@/lib/utils";
import type { Severity } from "@/types";

const config: Record<Severity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "badge-critical" },
  high: { label: "High", className: "badge-high" },
  medium: { label: "Medium", className: "badge-medium" },
  low: { label: "Low", className: "badge-low" },
  info: { label: "Info", className: "badge-info" },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const { label, className: baseClass } = config[severity];
  return <span className={cn(baseClass, className)}>{label}</span>;
}

export function severityOrder(severity: Severity): number {
  const order: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  return order[severity];
}
