"use client";

import { cn } from "@/lib/utils";
import { reviewFlowCopy } from "../copy";
import { useIsClient } from "../hooks/use-is-client";
import { useScrollProgress } from "../hooks/use-scroll-progress";
import { ReviewStage } from "./review-stage";

const STEP_COUNT = reviewFlowCopy.steps.length;

export function ReviewFlow() {
  const { ref, progress, scrollToFraction } = useScrollProgress<HTMLDivElement>();
  const isClient = useIsClient();
  const step = Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT));

  return (
    <section aria-labelledby="review-flow-title" className="py-14 md:py-20">
      <div ref={ref} className="relative lg:h-[92rem]">
        <div className="lg:sticky lg:top-20 lg:z-10 lg:bg-background">
          <header>
            <p className="mb-4 font-mono text-xs tracking-wide text-eyebrow uppercase">
              {reviewFlowCopy.eyebrow}
            </p>
            <h2
              id="review-flow-title"
              className="text-3xl font-medium tracking-[-0.02em] md:text-4xl"
            >
              {reviewFlowCopy.title}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">{reviewFlowCopy.lead}</p>
          </header>
          <div className="mt-12 grid overflow-hidden rounded-md border lg:grid-cols-4">
            <div className="relative lg:border-r">
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 -right-px hidden w-1 bg-eyebrow transition-[height] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] lg:block"
                style={{ height: `${((step + 1) / STEP_COUNT) * 100}%` }}
              />
              <ol className="flex flex-col gap-6 p-6 lg:h-[38rem] lg:justify-between lg:gap-0 lg:p-8">
                {reviewFlowCopy.steps.map((item, index) => {
                  const isActive = index === step;
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => scrollToFraction((index + 0.5) / STEP_COUNT)}
                        className="flex w-full flex-col text-left"
                      >
                        <span
                          className={cn(
                            "font-semibold transition-colors duration-300",
                            isActive ? "text-foreground" : "lg:text-muted-foreground"
                          )}
                        >
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            "mt-1 max-w-[24rem] text-muted-foreground",
                            isActive ? "lg:block" : "lg:hidden"
                          )}
                        >
                          {item.body}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div
              role="img"
              aria-label={reviewFlowCopy.stageLabel}
              className="hidden lg:col-span-3 lg:block lg:h-[38rem]"
            >
              {isClient ? <ReviewStage step={step} /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
