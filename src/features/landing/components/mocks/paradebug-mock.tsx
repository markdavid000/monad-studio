"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { mockLabels } from "../../copy";
import { step } from "../../lib/step";
import type { ParadebugMockData } from "../../types";
import { MockWindow } from "./mock-window";

function isRepeated(calls: readonly string[], call: string) {
  return calls.filter((item) => item === call).length > 1;
}

interface ParadebugMockProps {
  data: ParadebugMockData;
}

export function ParadebugMock({ data }: ParadebugMockProps) {
  const [focus, setFocus] = useState<string | null>(null);
  const raw = {
    contract: data.contract,
    range: mockLabels.range,
    sameBlockRepeats: data.functions.map(({ name, blocks, of }) => ({
      function: name,
      blocks,
      of,
    })),
  };

  return (
    <MockWindow title={data.contract} meta={mockLabels.range} raw={raw}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase">
            {mockLabels.blocksLabel}
          </p>
          <ul className="flex flex-col gap-2">
            {data.blocks.map((block, blockIndex) => (
              <li
                key={block.number}
                data-step
                style={step(blockIndex * 3)}
                className="rounded-md border p-2.5"
              >
                <p className="font-mono text-xs text-muted-foreground">{block.number}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {block.calls.map((call, index) => (
                    <span
                      key={`${block.number}-${index}`}
                      data-step="pop"
                      style={step(blockIndex * 3 + 1 + index * 0.5)}
                      className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[11px] transition-opacity duration-300",
                        focus !== null && call !== focus && "opacity-25",
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
          <p className="font-mono text-[11px] text-muted-foreground uppercase">
            {mockLabels.functionsLabel}
          </p>
          <p className="mb-2 text-xs text-muted-foreground">{mockLabels.pickFunction}</p>
          <ul className="flex flex-col gap-3">
            {data.functions.map((fn, index) => (
              <li key={fn.name} data-step style={step(4 + index * 2)}>
                <button
                  type="button"
                  aria-pressed={focus === fn.name}
                  onClick={() => setFocus((current) => (current === fn.name ? null : fn.name))}
                  className={cn(
                    "block w-full rounded-md p-1.5 text-left transition-colors hover:bg-muted/30",
                    focus === fn.name && "bg-eyebrow/10 ring-1 ring-eyebrow/40"
                  )}
                >
                  <div className="flex justify-between font-mono text-xs">
                    <span>{fn.name}</span>
                    <span className="text-muted-foreground">
                      {fn.blocks} {mockLabels.blocksSuffix}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      data-grow
                      style={{ ...step(4 + index * 2), width: `${(fn.blocks / fn.of) * 100}%` }}
                      className="h-full rounded-full bg-severity-high"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MockWindow>
  );
}
