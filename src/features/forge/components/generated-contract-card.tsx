import { CircleAlert, CircleCheck, FileInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeView } from "@/components/ui/code-view";
import { errorsTitle, forgeCopy } from "../copy";
import type { GeneratedContract } from "../types";
import { CopyButton } from "./copy-button";

interface GeneratedContractCardProps {
  contract: GeneratedContract;
  onUse: (contract: GeneratedContract) => void;
}

const copy = forgeCopy.generate;

export function GeneratedContractCard({ contract, onUse }: GeneratedContractCardProps) {
  const compiles = contract.compile.status === "compiled";
  const errorLines = new Set(
    contract.compile.status === "failed"
      ? contract.compile.errors.flatMap((error) => (error.line ? [error.line] : []))
      : []
  );
  const lines = contract.source.split("\n").map((text, index) => ({
    key: `g${index + 1}`,
    number: index + 1,
    text,
    flagged: errorLines.has(index + 1),
  }));

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-mono text-sm">{contract.fileName}</h3>
          <span
            className={
              compiles
                ? "flex items-center gap-1.5 text-xs text-success"
                : "flex items-center gap-1.5 text-xs text-severity-critical"
            }
          >
            {compiles ? (
              <CircleCheck aria-hidden className="size-3.5" />
            ) : (
              <CircleAlert aria-hidden className="size-3.5" />
            )}
            {compiles ? copy.compiles : copy.doesNotCompile}
            {contract.compile.status === "failed"
              ? ` · ${errorsTitle(contract.compile.errors.length)}`
              : null}
          </span>
        </div>
        <p className="text-sm">{contract.summary}</p>
        {contract.notes.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {copy.notesLabel}
            </p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {contract.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button onClick={() => onUse(contract)}>
            <FileInput aria-hidden />
            {copy.use}
          </Button>
          <CopyButton text={contract.source} label={copy.copy} copiedLabel={copy.copied} />
          <p className="text-xs text-muted-foreground">{copy.useNote}</p>
        </div>
      </div>
      <CodeView label={copy.codeLabel} lines={lines} className="min-h-0" />
    </article>
  );
}
