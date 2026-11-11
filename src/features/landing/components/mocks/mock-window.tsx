import type { ReactNode } from "react";
import { landingCopy } from "../../copy";

interface MockWindowProps {
  title: string;
  meta: string;
  hasScan?: boolean;
  children: ReactNode;
}

export function MockWindow({ title, meta, hasScan = false, children }: MockWindowProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl shadow-black/30">
      <div className="flex items-center gap-3 border-b px-4 py-2.5 font-mono text-xs text-muted-foreground">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        </span>
        <span className="truncate text-foreground">{title}</span>
        <span className="truncate">{meta}</span>
        <span className="ml-auto shrink-0 rounded border px-1.5 py-0.5">
          {landingCopy.exampleData}
        </span>
      </div>
      <div className="relative overflow-hidden p-4 sm:p-5">
        {hasScan ? (
          <span
            aria-hidden
            data-scan
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-eyebrow/20 to-transparent opacity-0"
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
