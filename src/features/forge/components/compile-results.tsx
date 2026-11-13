import type { ReactNode } from "react";
import { DiffCode } from "@/components/ui/diff-code";
import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { forgeCopy } from "../copy";
import type { CompileResult, ErrorFix } from "../types";
import { CompileOutput } from "./compile-output";
import { ErrorFixPanel } from "./error-fix-panel";
import { SourceCode } from "./source-code";

interface CompileResultsProps {
  result: CompileResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  source: string;
  isStale: boolean;
  focusedLine: number | undefined;
  onFocusLine: (line: number) => void;
  footer: ReactNode;
  suggestedFix: ErrorFix | undefined;
  onBackToResult: () => void;
  deployment: ReactNode;
}

export function CompileResults({ result, suggestedFix, ...props }: CompileResultsProps) {
  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={forgeCopy.compile.resultsTitle}
      description={props.fileName || forgeCopy.untitled}
      closeLabel={aiCopy.closeResults}
      footer={props.footer}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          {suggestedFix ? (
            <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
              <div className="border-b px-4 py-2">
                <span className="truncate font-mono text-sm">
                  {props.fileName || forgeCopy.untitled}
                </span>
              </div>
              <DiffCode
                label={forgeCopy.compile.fixes.diffLabel}
                before={props.source}
                after={suggestedFix.fixedSource}
              />
            </section>
          ) : (
            <SourceCode
              label={forgeCopy.compile.compiledCodeLabel}
              fileName={props.fileName}
              source={props.source}
              errors={result.status === "failed" ? result.errors : []}
              focusedLine={props.focusedLine}
              canEdit
            />
          )}
        </div>
        {suggestedFix ? (
          <ErrorFixPanel fix={suggestedFix} onBack={props.onBackToResult} />
        ) : (
          <div className="flex min-w-0 flex-col gap-5">
            <CompileOutput
              result={result}
              isStale={props.isStale}
              onFocusLine={props.onFocusLine}
            />
            {props.deployment}
          </div>
        )}
      </div>
    </ResultsSheet>
  );
}
