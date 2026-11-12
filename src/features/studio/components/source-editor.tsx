"use client";

import { useRef, type UIEvent } from "react";
import { cn } from "@/lib/utils";
import { studioCopy } from "../copy";
import { SOURCE_LIMIT_BYTES, byteSize, formatKilobytes } from "../lib/byte-size";

interface SourceEditorProps {
  name: string;
  source: string;
  onChange: (source: string) => void;
  onClear: () => void;
}

export function SourceEditor({ name, source, onChange, onClear }: SourceEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(1, source.split("\n").length);
  const bytes = byteSize(source);
  const isTooLarge = bytes > SOURCE_LIMIT_BYTES;

  function handleScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="truncate font-mono text-xs">{name || studioCopy.untitled}</span>
        {source ? (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto rounded px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {studioCopy.clear}
          </button>
        ) : null}
      </div>
      <div className="relative flex min-h-[28rem] flex-1">
        <div
          ref={gutterRef}
          aria-hidden
          className="w-12 shrink-0 overflow-hidden border-r bg-background/40 py-4 pr-3 text-right font-mono text-[13px] leading-6 text-muted-foreground/60 select-none"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <textarea
          aria-label={studioCopy.editorLabel}
          value={source}
          onChange={(event) => onChange(event.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder={studioCopy.placeholder}
          className="flex-1 resize-none bg-transparent px-4 py-4 font-mono text-[13px] leading-6 whitespace-pre outline-none placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="flex items-center gap-4 border-t px-4 py-2 font-mono text-xs text-muted-foreground">
        <span>
          {lineCount} {lineCount === 1 ? studioCopy.line : studioCopy.lines}
        </span>
        <span className={cn(isTooLarge && "text-severity-critical")}>
          {formatKilobytes(bytes)} {studioCopy.sizeOf}
        </span>
        {isTooLarge ? <span className="text-severity-critical">{studioCopy.tooLarge}</span> : null}
      </div>
    </div>
  );
}
