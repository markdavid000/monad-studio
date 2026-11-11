"use client";

import type { ReactNode } from "react";
import { landingCopy, showcaseTabs, type ShowcaseTabId } from "../copy";
import { useShowcase } from "../hooks/use-showcase";
import { RotatingWord } from "./rotating-word";
import { Showcase } from "./showcase";

interface HeroStageProps {
  aside: ReactNode;
  panels: Record<ShowcaseTabId, ReactNode>;
}

export function HeroStage({ aside, panels }: HeroStageProps) {
  const showcase = useShowcase(showcaseTabs.length);
  const verb = showcaseTabs[showcase.active].verb;

  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-14 pt-20 pb-24 sm:pt-28">
      <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-wide text-eyebrow uppercase">
            {landingCopy.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-5xl leading-[1.05] font-medium tracking-[-0.03em] sm:text-6xl"
          >
            <span className="sr-only">{landingCopy.titleAccessible}</span>
            <span aria-hidden className="block">
              {landingCopy.titleLead}
            </span>
            <span aria-hidden className="flex flex-wrap gap-x-[0.25em]">
              <RotatingWord word={verb} shouldAnimate={showcase.hasChanged} />
              <span>{landingCopy.titleSuffix}</span>
            </span>
          </h1>
        </div>
        {aside}
      </div>
      <div className="relative overflow-hidden rounded-xl border bg-muted/30 p-4 sm:p-6">
        <Showcase panels={panels} {...showcase} />
        <div aria-hidden className="color-bar absolute inset-x-0 bottom-0 h-0.5 opacity-70" />
      </div>
    </section>
  );
}
