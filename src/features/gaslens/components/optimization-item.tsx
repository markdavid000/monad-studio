import { ChevronDown } from "lucide-react";
import { linesLabel } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { savingLabel } from "../copy";
import type { Optimization } from "../types";
import { ImpactBadge } from "./impact-badge";

interface OptimizationItemProps {
  item: Optimization;
  isOpen: boolean;
  onToggle: () => void;
}

export function OptimizationItem({ item, isOpen, onToggle }: OptimizationItemProps) {
  const panelId = `optimization-${item.id}`;

  return (
    <li
      className={cn(
        "rounded-lg border transition-colors",
        isOpen ? "bg-muted/30" : "border-transparent"
      )}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/40"
      >
        <ImpactBadge impact={item.impact} />
        <span className="min-w-0 flex-1 text-sm font-medium">{item.title}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen ? (
        <div id={panelId} className="flex flex-col gap-3 px-3 pt-1 pb-4 text-sm">
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
            <span className="text-success">{savingLabel(item.estimatedGas, item.per)}</span>
            <span className="text-muted-foreground">{linesLabel(item.lines)}</span>
          </p>
          <p className="leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      ) : null}
    </li>
  );
}
