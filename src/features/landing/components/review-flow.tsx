"use client";

import { cn } from "@/lib/utils";
import { reviewFlowCopy } from "../copy";
import { useScrollProgress } from "../hooks/use-scroll-progress";
import { ReviewStage } from "./review-stage";

const STEP_COUNT = reviewFlowCopy.steps.length;

export function ReviewFlow() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const step = Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));

  return (
    <section aria-labelledby="review-flow-title" className="border-t py-20 sm:py-24">
      <div className="flex max-w-2xl flex-col gap-4">
        <p className="font-mono text-xs tracking-wide text-eyebrow uppercase">
          {reviewFlowCopy.eyebrow}
        </p>
        <h2 id="review-flow-title" className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
          {reviewFlowCopy.title}
        </h2>
        <p className="text-lg text-muted-foreground">{reviewFlowCopy.lead}</p>
      </div>
      <div ref={ref} className="mt-10 lg:h-[260vh]">
        <div className="grid overflow-hidden rounded-xl border lg:sticky lg:top-20 lg:h-[34rem] lg:grid-cols-[22rem_1fr]">
          <div className="relative border-b lg:border-r lg:border-b-0">
            <span
              aria-hidden
              className="absolute top-0 right-0 hidden w-0.5 bg-eyebrow transition-[height] duration-200 lg:block"
              style={{ height: `${progress * 100}%` }}
            />
            <ol className="flex h-full flex-col justify-between gap-6 p-6 lg:py-8">
              {reviewFlowCopy.steps.map((item, index) => {
                const isActive = index === step;
                return (
                  <li
                    key={item.title}
                    aria-current={isActive ? "step" : undefined}
                    className="flex flex-col gap-1.5"
                  >
                    <p
                      className={cn(
                        "font-medium transition-colors duration-300",
                        isActive ? "text-foreground" : "lg:text-muted-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        "text-sm text-muted-foreground transition-opacity duration-500",
                        isActive ? "lg:opacity-100" : "lg:hidden"
                      )}
                    >
                      {item.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
          <div role="img" aria-label={reviewFlowCopy.stageLabel} className="hidden lg:block">
            <ReviewStage step={step} />
          </div>
        </div>
      </div>
    </section>
  );
}
