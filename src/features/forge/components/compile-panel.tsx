import { Hammer, LoaderCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CodeView } from "@/components/ui/code-view";
import { EmptyState } from "@/components/ui/empty-state";
import { ToolActions } from "@/components/ui/tool-actions";
import { forgeCopy } from "../copy";
import type { CompileResult } from "../types";
import { CompileOutput } from "./compile-output";

interface CompilePanelProps {
  fileName: string;
  source: string;
  isEmpty: boolean;
  isTooLarge: boolean;
  isCompiling: boolean;
  isStale: boolean;
  result: CompileResult | undefined;
  focusedLine: number | undefined;
  onFocusLine: (line: number) => void;
  onCompile: () => void;
}

const copy = forgeCopy.compile;

function runLabel(isCompiling: boolean, hasResult: boolean) {
  if (isCompiling) return copy.running;
  return hasResult ? copy.rerun : copy.run;
}

export function CompilePanel(props: CompilePanelProps) {
  const errorLines = new Set(
    props.result?.status === "failed" && !props.isStale
      ? props.result.errors.flatMap((error) => (error.line ? [error.line] : []))
      : []
  );
  const lines = props.source.split("\n").map((text, index) => ({
    key: `c${index + 1}`,
    number: index + 1,
    text,
    flagged: errorLines.has(index + 1),
    highlighted: props.focusedLine === index + 1,
  }));

  return (
    <section aria-labelledby="compile-title" className="flex flex-col gap-4">
      <h2 id="compile-title" className="text-xl font-medium">
        {copy.heading}
      </h2>
      {props.isEmpty ? (
        <EmptyState
          title={copy.emptyTitle}
          body={copy.emptyBody}
          action={
            <Button asChild>
              <Link href="/studio">{copy.openWorkspace}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
              <span className="truncate font-mono text-sm">
                {props.fileName || forgeCopy.untitled}
              </span>
              <Link
                href="/studio"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil aria-hidden className="size-3.5" />
                {copy.editInWorkspace}
              </Link>
            </div>
            <CodeView
              label={copy.codeLabel}
              lines={lines}
              scrollTo={props.focusedLine ? `c${props.focusedLine}` : undefined}
            />
          </div>
          <ToolActions
            note={copy.note}
            tooLarge={
              props.isTooLarge
                ? { message: copy.tooLarge, editLabel: copy.editInWorkspace }
                : undefined
            }
          >
            <Button size="lg" onClick={props.onCompile} disabled={props.isCompiling}>
              {props.isCompiling ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <Hammer aria-hidden />
              )}
              {runLabel(props.isCompiling, props.result !== undefined)}
            </Button>
          </ToolActions>
          <p className="text-xs text-muted-foreground">{forgeCopy.settings}</p>
          {props.result ? (
            <CompileOutput
              result={props.result}
              isStale={props.isStale}
              onFocusLine={props.onFocusLine}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
