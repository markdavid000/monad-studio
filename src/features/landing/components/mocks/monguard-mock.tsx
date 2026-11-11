"use client";

import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";
import type { MonguardMockData } from "../../types";
import { DiffLines } from "./diff-lines";
import { MockWindow } from "./mock-window";
import { SeverityPill } from "./severity-pill";

interface MonguardMockProps {
  data: MonguardMockData;
}

export function MonguardMock({ data }: MonguardMockProps) {
  const [first, ...rest] = data.findings;

  return (
    <MockWindow title={data.file} meta={data.tool}>
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <p className="text-sm text-muted-foreground">{mockLabels.scoreLabel}</p>
        <p className="font-mono">
          <span
            className={cn(
              "text-3xl font-medium",
              data.score >= 80
                ? "text-success"
                : data.score >= 50
                  ? "text-severity-medium"
                  : "text-severity-high"
            )}
          >
            {data.score}
          </span>
          <span className="text-sm text-muted-foreground">{mockLabels.scoreOutOf}</span>
        </p>
      </div>
      <div className="mt-4 rounded-md border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityPill level={first.severity} />
          <p className="text-sm font-medium">{first.title}</p>
          <p className="font-mono text-xs text-muted-foreground">{first.lines}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{first.detail}</p>
        <p className="mt-3 mb-1.5 font-mono text-[11px] text-muted-foreground uppercase">
          {mockLabels.fixLabel}
        </p>
        <DiffLines lines={data.fix} />
      </div>
      <ul className="mt-3 divide-y">
        {rest.map((finding) => (
          <li key={finding.title} className="flex items-center gap-2 py-2.5">
            <SeverityPill level={finding.severity} />
            <span className="truncate text-sm">{finding.title}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
              {finding.lines}
            </span>
          </li>
        ))}
      </ul>
    </MockWindow>
  );
}
