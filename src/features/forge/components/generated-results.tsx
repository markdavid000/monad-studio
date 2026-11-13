import { CircleAlert, CircleCheck, FileInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { errorsTitle, forgeCopy } from "../copy";
import type { GeneratedContract } from "../types";
import { CopyButton } from "./copy-button";
import { DiagnosticList } from "./diagnostic-list";
import { SourceCode } from "./source-code";

interface GeneratedResultsProps {
  contract: GeneratedContract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusedLine: number | undefined;
  onFocusLine: (line: number) => void;
  onUse: (contract: GeneratedContract) => void;
}

const copy = forgeCopy.generate;

export function GeneratedResults({ contract, ...props }: GeneratedResultsProps) {
  const { compile } = contract;
  const compiles = compile.status === "compiled";

  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={copy.resultsTitle}
      description={contract.contractName}
      closeLabel={aiCopy.closeResults}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          <SourceCode
            label={copy.codeLabel}
            fileName={contract.fileName}
            source={contract.source}
            errors={compile.status === "failed" ? compile.errors : []}
            focusedLine={props.focusedLine}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-1 border-b pb-5">
            <p className="font-mono text-sm">{contract.fileName}</p>
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                compiles ? "text-success" : "text-severity-critical"
              )}
            >
              {compiles ? (
                <CircleCheck aria-hidden className="size-4" />
              ) : (
                <CircleAlert aria-hidden className="size-4" />
              )}
              {compiles ? copy.compiles : copy.doesNotCompile}
            </p>
          </div>
          <p className="leading-relaxed">{contract.summary}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button onClick={() => props.onUse(contract)}>
              <FileInput aria-hidden />
              {copy.use}
            </Button>
            <CopyButton text={contract.source} label={copy.copy} copiedLabel={copy.copied} />
          </div>
          {compile.status === "failed" ? (
            <DiagnosticList
              label={errorsTitle(compile.errors.length)}
              items={compile.errors}
              onFocusLine={props.onFocusLine}
            />
          ) : null}
          {contract.notes.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {copy.notesLabel}
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                {contract.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">{copy.note}</p>
        </div>
      </div>
    </ResultsSheet>
  );
}
