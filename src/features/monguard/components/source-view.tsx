import { Pencil } from "lucide-react";
import Link from "next/link";
import { CodeView, type CodeLine } from "@/components/ui/code-view";
import { monguardCopy } from "../copy";

interface SourceViewProps {
  fileName: string;
  source: string;
  highlightedLines: readonly number[];
  canEdit: boolean;
}

export function SourceView({ fileName, source, highlightedLines, canEdit }: SourceViewProps) {
  const highlighted = new Set(highlightedLines);
  const lines: CodeLine[] = source.split("\n").map((text, index) => ({
    key: String(index + 1),
    number: index + 1,
    text,
    highlighted: highlighted.has(index + 1),
  }));

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="truncate font-mono text-sm">{fileName || monguardCopy.untitled}</span>
        {canEdit ? (
          <Link
            href="/studio"
            className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil aria-hidden className="size-3.5" />
            {monguardCopy.editInWorkspace}
          </Link>
        ) : null}
      </div>
      <CodeView
        label={monguardCopy.sourceLabel}
        lines={lines}
        scrollTo={highlightedLines.length > 0 ? String(highlightedLines[0]) : undefined}
      />
    </section>
  );
}
