"use client";

import { step } from "../../lib/step";
import type { GaslensMockData } from "../../types";
import { DiffLines } from "./diff-lines";
import { MockWindow } from "./mock-window";
import { SeverityPill } from "./severity-pill";

interface GaslensMockProps {
  data: GaslensMockData;
}

export function GaslensMock({ data }: GaslensMockProps) {
  return (
    <MockWindow title={data.file} meta={data.tool} hasScan>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{data.summary}</p>
        <p data-step style={step(12)} className="font-mono text-sm text-success">
          {data.saving}
        </p>
      </div>
      <DiffLines lines={data.diff} firstStep={1} />
      <ul className="mt-4 divide-y">
        {data.findings.map((finding, index) => (
          <li
            key={finding.title}
            data-step
            style={step(9 + index)}
            className="flex items-center gap-2 py-2.5"
          >
            <SeverityPill level={finding.impact} />
            <span className="truncate text-sm">{finding.title}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-success">
              {finding.saving}
            </span>
          </li>
        ))}
      </ul>
    </MockWindow>
  );
}
