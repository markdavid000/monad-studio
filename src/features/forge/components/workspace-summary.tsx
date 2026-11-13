import { FileCode, Pencil } from "lucide-react";
import Link from "next/link";
import { byteSize, formatKilobytes } from "@/lib/byte-size";
import { cn } from "@/lib/utils";
import { forgeCopy, linesAndSize } from "../copy";
import type { ContractOutline } from "../lib/outline";

const copy = forgeCopy.compile;

interface WorkspaceSummaryProps {
  fileName: string;
  source: string;
  outline: ContractOutline;
  isTooLarge: boolean;
}

export function WorkspaceSummary(props: WorkspaceSummaryProps) {
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
