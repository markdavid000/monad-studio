import { cn } from "@/lib/utils";
import { step } from "../../lib/step";
import type { DiffLine } from "../../types";

interface DiffLinesProps {
  lines: readonly DiffLine[];
  firstStep?: number;
}

export function DiffLines({ lines, firstStep = 0 }: DiffLinesProps) {
  return (
    <div className="overflow-hidden rounded-md border font-mono text-[11px] leading-6 sm:text-xs">
      {lines.map((line, index) => (
        <div
          key={`${index}-${line.text}`}
          data-step
          style={step(firstStep + index)}
          className={cn(
            "overflow-hidden px-3 text-ellipsis whitespace-pre before:mr-3 before:inline-block before:w-2 before:text-muted-foreground",
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
