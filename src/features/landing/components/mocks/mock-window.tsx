"use client";

import { Braces } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";

interface MockWindowProps {
  title: string;
  meta: string;
  raw: unknown;
  hasScan?: boolean;
  children: ReactNode;
}

export function MockWindow({ title, meta, raw, hasScan = false, children }: MockWindowProps) {
  const [isRawOpen, setIsRawOpen] = useState(false);

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
        <button
          type="button"
          aria-pressed={isRawOpen}
          onClick={() => setIsRawOpen((open) => !open)}
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1.5 rounded border px-1.5 py-0.5 transition-colors",
            isRawOpen
              ? "border-eyebrow/60 bg-eyebrow/15 text-eyebrow"
              : "hover:border-eyebrow/50 hover:text-foreground"
          )}
        >
          <Braces aria-hidden className="size-3" />
          {isRawOpen ? mockLabels.hideRaw : mockLabels.showRaw}
        </button>
      </div>
      <div className="relative overflow-hidden p-4 sm:p-5">
        {hasScan ? (
          <span
            aria-hidden
            data-scan
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-eyebrow/20 to-transparent opacity-0"
          />
        ) : null}
        <div className={cn("transition-opacity duration-300", isRawOpen && "opacity-0")}>
          {children}
        </div>
        {isRawOpen ? (
          <div className="absolute inset-0 flex animate-[rise-in_0.3s_ease-out] flex-col gap-2 overflow-auto bg-card p-4 sm:p-5">
            <p className="font-mono text-[11px] text-muted-foreground uppercase">
              {mockLabels.rawTitle}
            </p>
            <pre className="font-mono text-[11px] leading-5 whitespace-pre-wrap text-foreground/90 sm:text-xs">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
