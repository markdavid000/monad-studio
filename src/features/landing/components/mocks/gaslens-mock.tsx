"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { step } from "../../lib/step";
import type { GaslensMockData } from "../../types";
import { DiffLines } from "./diff-lines";
import { MockWindow } from "./mock-window";
import { SeverityPill } from "./severity-pill";

interface GaslensMockProps {
  data: GaslensMockData;
}

export function GaslensMock({ data }: GaslensMockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const raw = {
    contract: data.file,
    estimatedSaving: data.saving,
    optimizations: data.findings.map(({ impact, title, saving }) => ({
      impact: impact.toLowerCase(),
      title,
      estimatedSavings: saving,
    })),
  };

  return (
    <MockWindow title={data.file} meta={data.tool} raw={raw} hasScan>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{data.summary}</p>
        <p data-step style={step(12)} className="font-mono text-sm text-success">
          {data.saving}
        </p>
      </div>
      <DiffLines
        lines={data.diff}
        firstStep={1}
        highlighted={selected === null ? undefined : data.findings[selected].lines}
      />
      <ul className="mt-4 flex flex-col gap-1">
        {data.findings.map((finding, index) => (
          <li key={finding.title} data-step style={step(9 + index)}>
            <button
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected((current) => (current === index ? null : index))}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                selected === index ? "bg-eyebrow/10 ring-1 ring-eyebrow/40" : "hover:bg-muted/30"
              )}
            >
              <SeverityPill level={finding.impact} />
              <span className="truncate text-sm">{finding.title}</span>
              <span className="ml-auto shrink-0 font-mono text-xs text-success">
                {finding.saving}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </MockWindow>
  );
}
