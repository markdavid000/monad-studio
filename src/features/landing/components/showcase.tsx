"use client";

import { Pause, Play } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { landingCopy, showcaseTabs, type ShowcaseTabId } from "../copy";
import { useIsClient } from "../hooks/use-is-client";

const SLIDE_SECONDS = 7;

interface ShowcaseProps {
  panels: Record<ShowcaseTabId, ReactNode>;
  active: number;
  isPaused: boolean;
  changes: number;
  select: (index: number) => void;
  advance: () => void;
  togglePause: () => void;
}

export function Showcase({
  panels,
  active,
  isPaused,
  changes,
  select,
  advance,
  togglePause,
}: ShowcaseProps) {
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
    <div className="flex flex-col gap-5">
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
                  "flex flex-col gap-2 pt-1 text-left font-mono text-xs transition-colors duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="h-0.5 w-full overflow-hidden rounded-full bg-border">
                  {isActive ? (
                    <span
                      key={`${tab.id}-${changes}`}
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
                  <span className="hidden text-muted-foreground xl:inline"> {tab.caption}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? landingCopy.play : landingCopy.pause}
          className="mt-2 hidden rounded-md border p-1.5 text-muted-foreground transition-colors hover:text-foreground motion-safe:block"
        >
          {isPaused ? (
            <Play aria-hidden className="size-3.5" />
          ) : (
            <Pause aria-hidden className="size-3.5" />
          )}
        </button>
      </div>
      <div className="lg:flex lg:h-[33rem] lg:gap-3">
        {showcaseTabs.map((tab, index) => {
          const isActive = index === active;
          return (
            <div
              key={tab.id}
              className={cn(
                "relative min-w-0 overflow-hidden rounded-lg transition-[flex-grow,opacity] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
                isActive ? "lg:flex-[10]" : "hidden opacity-35 hover:opacity-60 lg:block lg:flex-1"
              )}
            >
              <div
                id={`showcase-panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`showcase-tab-${tab.id}`}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                <div
                  key={isActive ? `active-${changes}` : "idle"}
                  data-play={isActive ? "true" : "static"}
                  className="scene lg:w-full lg:min-w-[42rem]"
                >
                  {isActive || isClient ? panels[tab.id] : null}
                </div>
              </div>
              {isActive ? null : (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`${landingCopy.showPreview} ${tab.label}`}
                  onClick={() => select(index)}
                  className="absolute inset-0 cursor-pointer"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
