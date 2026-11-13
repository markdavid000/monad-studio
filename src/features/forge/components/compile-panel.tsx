import { FileCode, Hammer, LoaderCircle, PanelRightOpen, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatKilobytes, byteSize } from "@/lib/byte-size";
import { cn } from "@/lib/utils";
import { compileSummary, forgeCopy, linesAndSize } from "../copy";
import type { ContractOutline } from "../lib/outline";
import type { CompileResult } from "../types";
import { PanelCard } from "./panel-card";

interface CompilePanelProps {
  fileName: string;
  source: string;
  outline: ContractOutline;
  isEmpty: boolean;
  isTooLarge: boolean;
  isCompiling: boolean;
  lastResult: CompileResult | undefined;
  isStale: boolean;
  onCompile: () => void;
  onShowResult: () => void;
}

const copy = forgeCopy.compile;

function runLabel(isCompiling: boolean, hasResult: boolean) {
  if (isCompiling) return copy.running;
  return hasResult ? copy.rerun : copy.run;
}

function LastCompile({ result, isStale }: { result: CompileResult; isStale: boolean }) {
  const compiled = result.status === "compiled";
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>{copy.lastLabel}</span>
      <span className={compiled ? "text-success" : "text-severity-critical"}>
        {compileSummary(compiled, compiled ? result.contracts.length : result.errors.length)}
      </span>
      {isStale ? <span>{copy.changedSince}</span> : null}
    </p>
  );
}

function ContractSummary(props: CompilePanelProps) {
  const lines = props.source.split("\n").length;
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <FileCode aria-hidden className="size-4 shrink-0 text-eyebrow" />
          <span className="truncate font-mono text-sm">{props.fileName || forgeCopy.untitled}</span>
        </span>
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil aria-hidden className="size-3.5" />
          {copy.editInWorkspace}
        </Link>
      </div>
      <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">{copy.lengthLabel}</dt>
        <dd className={cn("font-mono", props.isTooLarge && "text-severity-critical")}>
          {linesAndSize(lines, formatKilobytes(byteSize(props.source)))}
        </dd>
        <dt className="text-muted-foreground">{copy.pragmaLabel}</dt>
        <dd className="font-mono">{props.outline.pragma ?? copy.noPragma}</dd>
        <dt className="text-muted-foreground">{copy.declaresLabel}</dt>
        <dd className="flex flex-wrap gap-1.5">
          {props.outline.declarations.length > 0 ? (
            props.outline.declarations.map((item) => (
              <span
                key={`${item.kind}-${item.name}`}
                className="rounded border px-1.5 py-0.5 font-mono text-[11px]"
              >
                {item.name}
              </span>
            ))
          ) : (
            <span>{copy.noDeclarations}</span>
          )}
        </dd>
      </dl>
    </div>
  );
}

export function CompilePanel(props: CompilePanelProps) {
  return (
    <PanelCard step={2} titleId="compile-title" title={copy.heading} lead={copy.lead}>
      {props.isEmpty ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-3 rounded-lg border border-dashed px-4 py-6">
          <p className="font-medium">{copy.emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{copy.emptyBody}</p>
          <Button asChild variant="outline">
            <Link href="/studio">{copy.openWorkspace}</Link>
          </Button>
        </div>
      ) : (
        <ContractSummary {...props} />
      )}
      <div className="mt-auto flex flex-col gap-3 border-t pt-4">
        {props.isTooLarge ? (
          <p role="alert" className="text-sm">
            {copy.tooLarge}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={props.onCompile}
            disabled={props.isCompiling || props.isEmpty || props.isTooLarge}
          >
            {props.isCompiling ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <Hammer aria-hidden />
            )}
            {runLabel(props.isCompiling, props.lastResult !== undefined)}
          </Button>
          {props.lastResult ? (
            <Button variant="outline" onClick={props.onShowResult}>
              <PanelRightOpen aria-hidden />
              {copy.showResults}
            </Button>
          ) : null}
        </div>
        {props.lastResult ? (
          <LastCompile result={props.lastResult} isStale={props.isStale} />
        ) : null}
        <p className="text-xs text-muted-foreground">{copy.note}</p>
      </div>
    </PanelCard>
  );
}
