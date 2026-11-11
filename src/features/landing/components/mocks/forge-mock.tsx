"use client";

import { Check, Loader } from "lucide-react";
import { mockLabels } from "../../copy";
import type { ForgeMockData } from "../../types";
import { MockWindow } from "./mock-window";

interface ForgeMockProps {
  data: ForgeMockData;
}

export function ForgeMock({ data }: ForgeMockProps) {
  return (
    <MockWindow title={data.file} meta={mockLabels.network}>
      <div className="grid gap-4 md:grid-cols-[1fr_15rem]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="font-mono text-[11px] text-muted-foreground uppercase">
              {mockLabels.promptLabel}
            </p>
            <p className="mt-1 text-sm">{data.prompt}</p>
          </div>
          <pre className="overflow-hidden rounded-md border p-3 font-mono text-[11px] leading-6 sm:text-xs">
            {data.code.map((line) => (
              <span key={line} className="block overflow-hidden text-ellipsis whitespace-pre">
                {line}
              </span>
            ))}
          </pre>
        </div>
        <div className="flex flex-col gap-3 rounded-md border p-3">
          <p className="text-sm font-medium">{mockLabels.deployTitle}</p>
          <div className="flex justify-between rounded bg-muted/40 px-2.5 py-1.5 font-mono text-xs">
            <span>{mockLabels.network}</span>
            <span className="text-muted-foreground">{mockLabels.chainId}</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{data.wallet}</p>
          <ol className="flex flex-col gap-2">
            {data.steps.map((step) => (
              <li key={step.label} className="flex items-center gap-2 text-xs">
                {step.state === "done" ? (
                  <Check aria-hidden className="size-3.5 text-success" />
                ) : (
                  <Loader aria-hidden className="size-3.5 text-eyebrow motion-safe:animate-spin" />
                )}
                <span className="truncate">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </MockWindow>
  );
}
