"use client";

import { Pause, Play } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { landingCopy, showcaseTabs, type ShowcaseTabId } from "../copy";
import { useIsClient } from "../hooks/use-is-client";
import { useShowcase } from "../hooks/use-showcase";

const SLIDE_SECONDS = 7;

interface ShowcaseProps {
  panels: Record<ShowcaseTabId, ReactNode>;
}

export function Showcase({ panels }: ShowcaseProps) {
  const { active, isPaused, changes, select, advance, togglePause } = useShowcase(
    showcaseTabs.length
  );
  const isClient = useIsClient();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (direction === 0) return;
    event.preventDefault();
    const next = (active + direction + showcaseTabs.length) % showcaseTabs.length;
    select(next);
    document.getElementById(`showcase-tab-${showcaseTabs[next].id}`)?.focus();
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label={landingCopy.showcaseLabel}
        onKeyDown={handleKeyDown}
        className="flex flex-col overflow-hidden rounded-xl border bg-card/40 lg:h-[36rem] lg:flex-row"
      >
        {showcaseTabs.map((tab, index) => {
          const isActive = index === active;
          return (
            <div
              key={tab.id}
              onMouseEnter={() => select(index)}
              className={cn(
                "relative flex min-w-0 flex-col border-b transition-[flex-grow] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] last:border-b-0 motion-reduce:transition-none lg:border-b-0 lg:border-l lg:first:border-l-0",
                isActive ? "lg:flex-[3.75]" : "lg:flex-1"
              )}
            >
              <button
                id={`showcase-tab-${tab.id}`}
                type="button"
                aria-label={`${tab.number} ${tab.label}`}
                aria-expanded={isActive}
                aria-controls={`showcase-panel-${tab.id}`}
                onClick={() => select(index)}
                className="flex h-14 shrink-0 items-center gap-3 overflow-hidden px-5 text-left whitespace-nowrap lg:border-b lg:px-6"
              >
                <span className="font-mono text-sm text-muted-foreground">{tab.number}</span>
                <span
                  className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
                <span
                  className={cn(
                    "truncate text-muted-foreground transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                >
                  {tab.caption}
                </span>
              </button>
              <div
                id={`showcase-panel-${tab.id}`}
                role="region"
                aria-labelledby={`showcase-tab-${tab.id}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn(
                  "relative flex-1 overflow-hidden px-5 pb-6 transition-opacity duration-500 lg:px-6 lg:pt-8",
                  isActive ? "opacity-100" : "hidden opacity-30 lg:block"
                )}
              >
                <div
                  key={isActive ? `active-${changes}` : "idle"}
                  data-play={isActive ? "true" : "static"}
                  className="scene lg:min-w-[42rem]"
                >
                  {isActive || isClient ? panels[tab.id] : null}
                </div>
              </div>
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-border"
                >
                  <span
                    key={`${tab.id}-${changes}`}
                    onAnimationEnd={advance}
                    className="block h-full origin-left bg-eyebrow motion-reduce:[animation:none]"
                    style={{
                      animation: `showcase-progress ${SLIDE_SECONDS}s linear forwards`,
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={togglePause}
        aria-label={isPaused ? landingCopy.play : landingCopy.pause}
        className="hidden self-end rounded-md border p-2 text-muted-foreground transition-colors hover:text-foreground motion-safe:block"
      >
        {isPaused ? (
          <Play aria-hidden className="size-3.5" />
        ) : (
          <Pause aria-hidden className="size-3.5" />
        )}
      </button>
    </div>
  );
}
