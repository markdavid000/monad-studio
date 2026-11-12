import { useLineScroll } from "@/hooks/use-line-scroll";
import { cn } from "@/lib/utils";

export interface CodeLine {
  key: string;
  number?: number;
  text: string;
  kind?: "add" | "remove";
  highlighted?: boolean;
  flagged?: boolean;
}

interface CodeViewProps {
  label: string;
  lines: readonly CodeLine[];
  scrollTo?: string;
  className?: string;
}

const MARKERS = { add: "+", remove: "-" } as const;

export function CodeView({ label, lines, scrollTo, className }: CodeViewProps) {
  const containerRef = useLineScroll(scrollTo);
  const hasMarkers = lines.some((line) => line.kind);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "relative max-h-[70vh] min-h-[24rem] overflow-auto py-3 font-mono text-[13px] leading-6",
        className
      )}
    >
      {lines.map((line) => (
        <div
          key={line.key}
          data-line={line.key}
          data-kind={line.kind}
          data-highlighted={line.highlighted || undefined}
          data-flagged={line.flagged || undefined}
          className={cn(
            "flex border-l-2 pr-4",
            line.flagged
              ? "border-severity-critical"
              : line.highlighted
                ? "border-eyebrow"
                : "border-transparent",
            line.kind === "add" && "bg-diff-add",
            line.kind === "remove" && "bg-diff-remove",
            line.highlighted && !line.kind && "bg-eyebrow/10"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "w-12 shrink-0 pr-3 text-right select-none",
              line.flagged ? "font-semibold text-severity-critical" : "text-muted-foreground/60"
            )}
          >
            {line.number}
          </span>
          {hasMarkers ? (
            <span
              aria-hidden
              className={cn(
                "w-4 shrink-0 select-none",
                line.kind === "add" && "text-success",
                line.kind === "remove" && "text-severity-critical"
              )}
            >
              {line.kind ? MARKERS[line.kind] : null}
            </span>
          ) : null}
          <code className="whitespace-pre">
            {line.kind ? <span className="sr-only">{MARKERS[line.kind]}</span> : null}
            {line.text || " "}
          </code>
        </div>
      ))}
    </div>
  );
}
