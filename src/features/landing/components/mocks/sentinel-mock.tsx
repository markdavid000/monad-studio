"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { callSummary, mockLabels } from "../../copy";
import { step } from "../../lib/step";
import type { SentinelMockData } from "../../types";
import { MockWindow } from "./mock-window";

const STATUS_TONE = {
  ok: "bg-success",
  flagged: "bg-severity-high",
  failed: "bg-severity-critical",
} as const;

interface SentinelMockProps {
  data: SentinelMockData;
}

export function SentinelMock({ data }: SentinelMockProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const raw = {
    contract: data.contract,
    address: data.address,
    calls: data.rows.map(({ method, from, ago, status }) => ({ method, from, ago, status })),
    flags: [{ title: data.flagTitle, message: data.flagBody }],
  };

  return (
    <MockWindow title={data.contract} meta={data.address} raw={raw}>
      <p className="mb-3 flex items-center gap-2 font-mono text-xs text-success">
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-success opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        {mockLabels.live}
      </p>
      <ul className="divide-y rounded-md border">
        {data.rows.map((row, index) => {
          const isSelected = selected === index;
          return (
            <li key={`${row.method}-${row.from}-${row.ago}`} data-step style={step(index * 2)}>
              <button
                type="button"
                aria-expanded={isSelected}
                onClick={() => setSelected((current) => (current === index ? null : index))}
                className={cn(
                  "flex w-full flex-col px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-muted/30",
                  row.status !== "ok" && "bg-severity-high/10"
                )}
              >
                <span className="flex w-full items-center gap-3">
                  <span
                    aria-hidden
                    className={cn("size-1.5 rounded-full", STATUS_TONE[row.status])}
                  />
                  <span className="w-16 truncate sm:w-20">{row.method}</span>
                  <span className="truncate text-muted-foreground">{row.from}</span>
                  <span className="ml-auto text-muted-foreground">{row.ago}</span>
                </span>
                {isSelected ? (
                  <span className="mt-1.5 block animate-[rise-in_0.25s_ease-out] pl-4 text-muted-foreground">
                    {callSummary(row.method, row.from, row.ago, mockLabels.status[row.status])}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div
        data-step="pop"
        data-ping
        style={step(data.rows.length * 2 + 1)}
        className="mt-4 rounded-md border border-severity-high/40 bg-severity-high/10 p-3"
      >
        <p className="text-sm font-medium text-severity-high">{data.flagTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{data.flagBody}</p>
        <p className="mt-2 font-mono text-xs text-eyebrow">{mockLabels.flagLink}</p>
      </div>
    </MockWindow>
  );
}
