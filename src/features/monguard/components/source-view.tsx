import { Pencil } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { monguardCopy } from "../copy";
import { useLineScroll } from "../hooks/use-line-scroll";

interface SourceViewProps {
  fileName: string;
  source: string;
  highlightedLines: readonly number[];
}

export function SourceView({ fileName, source, highlightedLines }: SourceViewProps) {
  const containerRef = useLineScroll(highlightedLines[0]);
  const highlighted = new Set(highlightedLines);
  const lines = source.split("\n");

  return (
    <section
      aria-label={monguardCopy.sourceLabel}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="truncate font-mono text-sm">{fileName || monguardCopy.untitled}</span>
        <Link
          href="/studio"
          className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil aria-hidden className="size-3.5" />
          {monguardCopy.editInWorkspace}
        </Link>
      </div>
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative max-h-[70vh] min-h-[24rem] overflow-auto py-3 font-mono text-[13px] leading-6"
      >
        {lines.map((line, index) => {
          const number = index + 1;
          const isHighlighted = highlighted.has(number);
          return (
            <div
              key={number}
              data-line={number}
              data-highlighted={isHighlighted || undefined}
              className={cn(
                "flex border-l-2 pr-4",
                isHighlighted ? "border-eyebrow bg-eyebrow/10" : "border-transparent"
              )}
            >
              <span
                aria-hidden
                className="w-12 shrink-0 pr-3 text-right text-muted-foreground/60 select-none"
              >
                {number}
              </span>
              <code className="whitespace-pre">{line || " "}</code>
            </div>
          );
        })}
      </div>
    </section>
  );
}
