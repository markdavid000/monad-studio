"use client";

import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";
import type { ParadebugMockData } from "../../types";
import { MockWindow } from "./mock-window";

function isRepeated(calls: readonly string[], call: string) {
  return calls.filter((item) => item === call).length > 1;
}

interface ParadebugMockProps {
  data: ParadebugMockData;
}

export function ParadebugMock({ data }: ParadebugMockProps) {
  return (
    <MockWindow title={data.contract} meta={mockLabels.range}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase">
            {mockLabels.blocksLabel}
          </p>
          <ul className="flex flex-col gap-2">
            {data.blocks.map((block) => (
              <li key={block.number} className="rounded-md border p-2.5">
                <p className="font-mono text-xs text-muted-foreground">{block.number}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {block.calls.map((call, index) => (
                    <span
                      key={`${block.number}-${index}`}
                      className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[11px]",
                        isRepeated(block.calls, call)
                          ? "border-severity-high/40 bg-severity-high/10 text-severity-high"
                          : "text-muted-foreground"
                      )}
                    >
                      {call}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase">
            {mockLabels.functionsLabel}
          </p>
          <ul className="flex flex-col gap-3">
            {data.functions.map((fn) => (
              <li key={fn.name}>
                <div className="flex justify-between font-mono text-xs">
                  <span>{fn.name}</span>
                  <span className="text-muted-foreground">
                    {fn.blocks} {mockLabels.blocksSuffix}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-severity-high"
                    style={{ width: `${(fn.blocks / fn.of) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MockWindow>
  );
}
