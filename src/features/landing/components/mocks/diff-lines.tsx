import { cn } from "@/lib/utils";
import type { DiffLine } from "../../types";

interface DiffLinesProps {
  lines: readonly DiffLine[];
}

export function DiffLines({ lines }: DiffLinesProps) {
  return (
    <div className="overflow-hidden rounded-md border font-mono text-[11px] leading-6 sm:text-xs">
      {lines.map((line, index) => (
        <div
          key={`${index}-${line.text}`}
          className={cn(
            "truncate px-3 whitespace-pre before:mr-3 before:inline-block before:w-2 before:text-muted-foreground",
            line.kind === "add" && "bg-diff-add before:content-['+']",
            line.kind === "remove" && "bg-diff-remove before:content-['-']",
            line.kind === "same" && "before:content-['']"
          )}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}
