"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";
import { scoreVar, step } from "../../lib/step";
import type { MonguardMockData } from "../../types";
import { DiffLines } from "./diff-lines";
import { MockWindow } from "./mock-window";
import { SeverityPill } from "./severity-pill";

interface MonguardMockProps {
  data: MonguardMockData;
}

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-severity-medium";
  return "text-severity-high";
}

export function MonguardMock({ data }: MonguardMockProps) {
  const [openIndex, setOpenIndex] = useState(0);
  const raw = {
    contract: data.file,
    score: data.score,
    findings: data.findings.map(({ severity, title, lines }) => ({
      severity: severity.toLowerCase(),
      title,
      lines,
    })),
  };

  return (
    <MockWindow title={data.file} meta={data.tool} raw={raw} hasScan>
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <p className="text-sm text-muted-foreground">{mockLabels.scoreLabel}</p>
        <p className="font-mono">
          <span className="sr-only">{data.score}</span>
          <span
            aria-hidden
            data-score
            style={scoreVar(data.score)}
            className={cn("text-3xl font-medium tabular-nums", scoreTone(data.score))}
          />
          <span className="text-sm text-muted-foreground">{mockLabels.scoreOutOf}</span>
        </p>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {data.findings.map((finding, index) => {
          const isOpen = index === openIndex;
          return (
            <li key={finding.title} data-step style={step(3 + index * 2)}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(index)}
                className={cn(
                  "flex w-full flex-col rounded-md border p-3 text-left transition-colors",
                  isOpen
                    ? "border-foreground/20 bg-muted/30"
                    : "border-transparent hover:bg-muted/30"
                )}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <SeverityPill level={finding.severity} />
                  <span className="text-sm font-medium">{finding.title}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {finding.lines}
                  </span>
                </span>
                {isOpen ? (
                  <span className="mt-2 block animate-[rise-in_0.3s_ease-out] text-sm text-muted-foreground">
                    {finding.detail}
                  </span>
                ) : null}
              </button>
              {isOpen && index === 0 ? (
                <div className="mt-2 px-3">
                  <p className="mb-1.5 font-mono text-[11px] text-muted-foreground uppercase">
                    {mockLabels.fixLabel}
                  </p>
                  <DiffLines lines={data.fix} firstStep={5} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </MockWindow>
  );
}
