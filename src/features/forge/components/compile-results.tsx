import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { forgeCopy } from "../copy";
import type { CompileResult } from "../types";
import { CompileOutput } from "./compile-output";
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
}

export function CompileResults({ result, ...props }: CompileResultsProps) {
  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={forgeCopy.compile.resultsTitle}
      description={props.fileName || forgeCopy.untitled}
      closeLabel={aiCopy.closeResults}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          <SourceCode
            label={forgeCopy.compile.compiledCodeLabel}
            fileName={props.fileName}
            source={props.source}
            errors={result.status === "failed" ? result.errors : []}
            focusedLine={props.focusedLine}
            canEdit
          />
        </div>
        <CompileOutput result={result} isStale={props.isStale} onFocusLine={props.onFocusLine} />
      </div>
    </ResultsSheet>
  );
}
