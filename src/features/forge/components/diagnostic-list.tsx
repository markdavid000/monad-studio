import { cn } from "@/lib/utils";
import { lineLabel } from "../copy";
import type { Diagnostic } from "../types";

export function DiagnosticList({
  label,
  items,
  onFocusLine,
}: {
  label: string;
  items: readonly Diagnostic[];
  onFocusLine?: (line: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{label}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={`${item.kind}-${item.line ?? 0}-${index}`}
            className={cn(
              "flex flex-col gap-1 rounded-lg border-l-2 bg-card px-4 py-3 text-sm",
              item.severity === "error" ? "border-severity-critical" : "border-severity-medium"
            )}
          >
            <span className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>{item.kind}</span>
              {item.line && onFocusLine ? (
                <button
                  type="button"
                  onClick={() => onFocusLine(item.line ?? 1)}
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  {lineLabel(item.line)}
                </button>
              ) : item.line ? (
                <span>{lineLabel(item.line)}</span>
              ) : null}
            </span>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
