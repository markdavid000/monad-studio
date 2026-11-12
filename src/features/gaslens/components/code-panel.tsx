import { Check, Copy, Pencil } from "lucide-react";
import Link from "next/link";
import { CodeView, type CodeLine } from "@/components/ui/code-view";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import { changeSummary, gaslensCopy } from "../copy";
import type { DiffLine } from "../lib/diff";

interface CodePanelProps {
  fileName: string;
  source: string;
  diff: readonly DiffLine[];
  optimizedSource: string | undefined;
  mode: "source" | "changes";
  hasChanges: boolean;
  highlightedLines: readonly number[];
  onModeChange: (mode: "source" | "changes") => void;
}

function sourceLines(source: string, highlighted: ReadonlySet<number>): CodeLine[] {
  return source.split("\n").map((text, index) => ({
    key: `o${index + 1}`,
    number: index + 1,
    text,
    highlighted: highlighted.has(index + 1),
  }));
}

function changeLines(diff: readonly DiffLine[], highlighted: ReadonlySet<number>): CodeLine[] {
  return diff.map((line, index) => ({
    key: line.oldNumber === undefined ? `n${index}` : `o${line.oldNumber}`,
    number: line.newNumber,
    text: line.text,
    kind: line.kind === "same" ? undefined : line.kind,
    highlighted: line.oldNumber !== undefined && highlighted.has(line.oldNumber),
  }));
}

export function CodePanel(props: CodePanelProps) {
  const { isCopied, copy } = useCopy();
  const highlighted = new Set(props.highlightedLines);
  const isChanges = props.mode === "changes";
  const lines = isChanges
    ? changeLines(props.diff, highlighted)
    : sourceLines(props.source, highlighted);
  const added = props.diff.filter((line) => line.kind === "add").length;
  const removed = props.diff.filter((line) => line.kind === "remove").length;
  const firstLine = props.highlightedLines[0];

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono text-sm">
            {props.fileName || gaslensCopy.untitled}
          </span>
          {props.hasChanges ? (
            <div
              role="group"
              aria-label={gaslensCopy.codeLabel}
              className="flex rounded-md border p-0.5"
            >
              {(["changes", "source"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={props.mode === mode}
                  onClick={() => props.onModeChange(mode)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs transition-colors",
                    props.mode === mode
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "changes" ? gaslensCopy.viewChanges : gaslensCopy.viewSource}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-xs">
          {isChanges ? (
            <span className="font-mono text-muted-foreground">{changeSummary(added, removed)}</span>
          ) : null}
          {isChanges && props.optimizedSource ? (
            <button
              type="button"
              onClick={() => copy(props.optimizedSource ?? "")}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {isCopied ? (
                <Check aria-hidden className="size-3.5" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              {isCopied ? gaslensCopy.copied : gaslensCopy.copyOptimised}
            </button>
          ) : (
            <Link
              href="/studio"
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil aria-hidden className="size-3.5" />
              {gaslensCopy.editInWorkspace}
            </Link>
          )}
        </div>
      </div>
      <CodeView
        label={isChanges ? gaslensCopy.viewChanges : gaslensCopy.viewSource}
        lines={lines}
        scrollTo={firstLine === undefined ? undefined : `o${firstLine}`}
      />
    </section>
  );
}
