import { Pencil } from "lucide-react";
import Link from "next/link";
import { CodeView } from "@/components/ui/code-view";
import { forgeCopy } from "../copy";
import type { Diagnostic } from "../types";

interface SourceCodeProps {
  label: string;
  fileName: string;
  source: string;
  errors?: readonly Diagnostic[];
  focusedLine?: number;
  canEdit?: boolean;
}

export function SourceCode({ errors = [], ...props }: SourceCodeProps) {
  const errorLines = new Set(errors.flatMap((error) => (error.line ? [error.line] : [])));
  const lines = props.source.split("\n").map((text, index) => ({
    key: `l${index + 1}`,
    number: index + 1,
    text,
    flagged: errorLines.has(index + 1),
    highlighted: props.focusedLine === index + 1,
  }));

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
        <span className="truncate font-mono text-sm">{props.fileName || forgeCopy.untitled}</span>
        {props.canEdit ? (
          <Link
            href="/studio"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil aria-hidden className="size-3.5" />
            {forgeCopy.compile.editInWorkspace}
          </Link>
        ) : null}
      </div>
      <CodeView
        label={props.label}
        lines={lines}
        scrollTo={props.focusedLine ? `l${props.focusedLine}` : undefined}
      />
    </section>
  );
}
