import { Hammer, LoaderCircle, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { compileSummary, forgeCopy } from "../copy";
import type { ContractOutline } from "../lib/outline";
import type { CompileResult } from "../types";
import { PanelCard } from "./panel-card";
import { WorkspaceSummary } from "./workspace-summary";

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
        <WorkspaceSummary
          fileName={props.fileName}
          source={props.source}
          outline={props.outline}
          isTooLarge={props.isTooLarge}
        />
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
