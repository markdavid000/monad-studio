"use client";

import { Pause, Play } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { landingCopy, showcaseTabs, type ShowcaseTabId } from "../copy";
import { useShowcase } from "../hooks/use-showcase";

const SLIDE_SECONDS = 7;

interface ShowcaseProps {
  panels: Record<ShowcaseTabId, ReactNode>;
}

export function Showcase({ panels }: ShowcaseProps) {
  const { active, isPaused, select, advance, togglePause } = useShowcase(showcaseTabs.length);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = (active + step + showcaseTabs.length) % showcaseTabs.length;
    select(next);
    document.getElementById(`showcase-tab-${showcaseTabs[next].id}`)?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          role="tablist"
          aria-label={landingCopy.showcaseLabel}
          onKeyDown={handleKeyDown}
          className="grid min-w-0 flex-1 grid-cols-[repeat(5,minmax(6.5rem,1fr))] gap-2 overflow-x-auto pb-1"
        >
          {showcaseTabs.map((tab, index) => {
            const isActive = index === active;
            return (
              <button
                key={tab.id}
                id={`showcase-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`showcase-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(index)}
                className={cn(
                  "group flex flex-col gap-2 pt-1 text-left font-mono text-xs transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="h-0.5 w-full overflow-hidden rounded-full bg-border">
                  {isActive ? (
                    <span
                      key={`${tab.id}-progress`}
                      onAnimationEnd={advance}
                      className="block h-full origin-left bg-eyebrow motion-reduce:[animation:none]"
                      style={{
                        animation: `showcase-progress ${SLIDE_SECONDS}s linear forwards`,
                        animationPlayState: isPaused ? "paused" : "running",
                      }}
                    />
                  ) : null}
                </span>
                <span>
                  <span className="text-eyebrow">{tab.number}</span> {tab.label}
                  <span className="hidden text-muted-foreground lg:inline"> {tab.caption}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? landingCopy.play : landingCopy.pause}
          className="mt-2 hidden rounded-md border p-1.5 text-muted-foreground hover:text-foreground motion-safe:block"
        >
          {isPaused ? (
            <Play aria-hidden className="size-3.5" />
          ) : (
            <Pause aria-hidden className="size-3.5" />
          )}
        </button>
      </div>
      {showcaseTabs.map((tab, index) => (
        <div
          key={tab.id}
          id={`showcase-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`showcase-tab-${tab.id}`}
          hidden={index !== active}
        >
          {panels[tab.id]}
        </div>
      ))}
    </div>
  );
}
