import { cn } from "@/lib/utils";
import { gaslensCopy } from "../copy";
import type { Optimization } from "../types";

const TONES: Record<Optimization["impact"], string> = {
  high: "text-severity-high border-severity-high/40 bg-severity-high/10",
  medium: "text-severity-medium border-severity-medium/40 bg-severity-medium/10",
  low: "text-severity-low border-severity-low/40 bg-severity-low/10",
};

interface ImpactBadgeProps {
  impact: Optimization["impact"];
}

export function ImpactBadge({ impact }: ImpactBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-16 shrink-0 items-center justify-center rounded-full border py-0.5 font-mono text-[11px]",
        TONES[impact]
      )}
    >
      {gaslensCopy.impact[impact]}
    </span>
  );
}
