"use client";

import { Check, Loader } from "lucide-react";
import { mockLabels } from "../../copy";
import { step } from "../../lib/step";
import type { ForgeMockData } from "../../types";
import { MockWindow } from "./mock-window";

interface ForgeMockProps {
  data: ForgeMockData;
}

export function ForgeMock({ data }: ForgeMockProps) {
  const raw = {
    contract: data.file,
    network: mockLabels.network,
    chainId: Number(mockLabels.chainId),
    deployer: data.wallet,
    steps: data.steps.map(({ label, state }) => ({ label, state })),
  };

  return (
    <MockWindow title={data.file} meta={mockLabels.network} raw={raw}>
      <div className="grid gap-4 md:grid-cols-[1fr_15rem]">
        <div className="flex min-w-0 flex-col gap-3">
          <div data-step style={step(0)} className="rounded-md border bg-muted/40 p-3">
            <p className="font-mono text-[11px] text-muted-foreground uppercase">
              {mockLabels.promptLabel}
            </p>
            <p className="mt-1 text-sm">{data.prompt}</p>
          </div>
          <pre className="overflow-hidden rounded-md border p-3 font-mono text-[11px] leading-6 sm:text-xs">
            {data.code.map((line, index) => (
              <span
                key={line}
                data-step
                style={step(2 + index)}
                className="block overflow-hidden text-ellipsis whitespace-pre"
              >
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
            {data.steps.map((item, index) => (
              <li
                key={item.label}
                data-step
                style={step(10 + index * 3)}
                className="flex items-center gap-2 text-xs"
              >
                {item.state === "done" ? (
                  <Check aria-hidden className="size-3.5 text-success" />
                ) : (
                  <Loader aria-hidden className="size-3.5 text-eyebrow motion-safe:animate-spin" />
                )}
                <span className="truncate">{item.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </MockWindow>
  );
}
