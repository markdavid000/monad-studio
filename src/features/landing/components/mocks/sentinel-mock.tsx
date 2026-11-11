"use client";

import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";
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
  return (
    <MockWindow title={data.contract} meta={data.address}>
      <p className="mb-3 flex items-center gap-2 font-mono text-xs text-success">
        <span aria-hidden className="size-1.5 rounded-full bg-success" />
        {mockLabels.live}
      </p>
      <ul className="divide-y rounded-md border">
        {data.rows.map((row) => (
          <li
            key={`${row.method}-${row.from}-${row.ago}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 font-mono text-xs",
              row.status === "flagged" && "bg-severity-high/10"
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", STATUS_TONE[row.status])} />
            <span className="w-16 truncate sm:w-20">{row.method}</span>
            <span className="truncate text-muted-foreground">{row.from}</span>
            <span className="ml-auto text-muted-foreground">{row.ago}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-md border border-severity-high/40 bg-severity-high/10 p-3">
        <p className="text-sm font-medium text-severity-high">{data.flagTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{data.flagBody}</p>
        <p className="mt-2 font-mono text-xs text-eyebrow">{mockLabels.flagLink}</p>
      </div>
    </MockWindow>
  );
}
