"use client";

import { ArrowRight, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ctaCopy } from "../copy";
import { useTryScan } from "../hooks/use-try-scan";
import { scoreVar, step } from "../lib/step";
import { SeverityPill } from "./mocks/severity-pill";

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-severity-medium";
  return "text-severity-high";
}

export function TryScan() {
  const { sample, phase, runs, select, run, finish } = useTryScan();
  const current = ctaCopy.samples[sample];

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <span className="mr-2 font-mono text-xs tracking-wide text-eyebrow uppercase">
          {ctaCopy.tryLabel}
        </span>
        <div role="group" aria-label={ctaCopy.samplesLabel} className="flex flex-wrap gap-2">
          {ctaCopy.samples.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={index === sample}
              onClick={() => select(index)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
                index === sample
                  ? "border-foreground/30 bg-foreground text-background"
                  : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {item.file}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto border-b bg-background/60 px-5 py-4 font-mono text-[13px] leading-6">
        {current.code.map((line) => (
          <span key={line} className="block whitespace-pre text-muted-foreground">
            {line}
          </span>
        ))}
      </pre>
      <div className="min-h-[19rem] p-5">
        {phase === "idle" ? (
          <button
            type="button"
            onClick={run}
            className="group flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary text-base font-medium text-primary-foreground transition-[transform,background-color] hover:bg-primary/90 active:scale-[0.99]"
          >
            <Play
              aria-hidden
              className="size-4 fill-current transition-transform group-hover:scale-110"
            />
            {ctaCopy.run}
          </button>
        ) : null}
        {phase === "scanning" ? (
          <div className="flex flex-col gap-3" aria-live="polite">
            <p className="font-mono text-sm text-muted-foreground">
              {ctaCopy.scanning} {current.file}
            </p>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                key={runs}
                onAnimationEnd={finish}
                className="block h-full origin-left rounded-full bg-primary"
                style={{
                  animation: "showcase-progress 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                }}
              />
            </span>
          </div>
        ) : null}
        {phase === "done" ? (
          <div key={runs} data-play="true" className="scene flex flex-col gap-4" aria-live="polite">
            <div className="flex items-end justify-between gap-4">
              <p className="font-mono">
                <span className="sr-only">{current.score}</span>
                <span
                  aria-hidden
                  data-score
                  style={scoreVar(current.score)}
                  className={cn("text-5xl font-medium tabular-nums", scoreTone(current.score))}
                />
                <span className="text-muted-foreground">{ctaCopy.outOf}</span>
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                {current.findings.length} {ctaCopy.findingsLabel}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {current.findings.map((finding, index) => (
                <li
                  key={finding.title}
                  data-step
                  style={step(2 + index * 2)}
                  className="flex items-center gap-2 text-sm"
                >
                  <SeverityPill level={finding.severity} />
                  <span className="truncate">{finding.title}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild className="group">
                <Link href="/studio">
                  {ctaCopy.openReport}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
              <Button type="button" variant="ghost" onClick={run}>
                <RotateCcw aria-hidden />
                {ctaCopy.rerun}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{ctaCopy.exampleNote}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
