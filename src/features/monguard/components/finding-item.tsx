import { Check, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/hooks/use-copy";
import { linesLabel } from "@/lib/copy";
import { includeFixLabel, monguardCopy } from "../copy";
import type { Finding } from "../types";
import { SeverityBadge } from "./severity-badge";

interface FindingChoice {
  isChosen: boolean;
  onToggle: () => void;
}

interface FindingItemProps {
  finding: Finding;
  isOpen: boolean;
  onToggle: () => void;
  choice?: FindingChoice;
}

export function FindingItem({ finding, isOpen, onToggle, choice }: FindingItemProps) {
  const { isCopied, copy } = useCopy();
  const panelId = `finding-${finding.id}`;

  return (
    <li
      className={cn(
        "rounded-lg border transition-colors",
        isOpen ? "bg-muted/30" : "border-transparent"
      )}
    >
      <div className="flex items-center">
        {choice ? (
          <input
            type="checkbox"
            checked={choice.isChosen}
            onChange={choice.onToggle}
            aria-label={includeFixLabel(finding.title)}
            className="ml-3 size-4 shrink-0 accent-[var(--eyebrow)]"
          />
        ) : null}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/40"
        >
          <SeverityBadge severity={finding.severity} />
          <span className="min-w-0 flex-1 text-sm font-medium">{finding.title}</span>
          <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
            {linesLabel(finding.lines)}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>
      {isOpen ? (
        <div id={panelId} className="flex flex-col gap-4 px-3 pt-1 pb-4 text-sm">
          <p className="font-mono text-xs text-muted-foreground sm:hidden">
            {linesLabel(finding.lines)}
          </p>
          <p className="leading-relaxed text-muted-foreground">{finding.description}</p>
          <div className="flex flex-col gap-1 border-l-2 border-eyebrow pl-3">
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {monguardCopy.impact}
            </p>
            <p className="leading-relaxed">{finding.impact}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {monguardCopy.fix}
              </p>
              <button
                type="button"
                onClick={() => copy(finding.fixCode || finding.fix)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {isCopied ? (
                  <Check aria-hidden className="size-3.5" />
                ) : (
                  <Copy aria-hidden className="size-3.5" />
                )}
                {isCopied ? monguardCopy.copied : monguardCopy.copyFix}
              </button>
            </div>
            <p className="leading-relaxed">{finding.fix}</p>
            {finding.fixCode ? (
              <pre className="overflow-x-auto rounded-md border bg-background/60 p-3 font-mono text-[12.5px] leading-5">
                <code>{finding.fixCode}</code>
              </pre>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
