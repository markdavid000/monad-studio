"use client";

import type { ReactNode } from "react";
import { landingCopy, type ShowcaseTabId } from "../copy";
import { useCycle } from "../hooks/use-cycle";
import { RotatingWord } from "./rotating-word";
import { Showcase } from "./showcase";

const WORD_MS = 2800;

interface HeroStageProps {
  aside: ReactNode;
  panels: Record<ShowcaseTabId, ReactNode>;
}

export function HeroStage({ aside, panels }: HeroStageProps) {
  const { index, hasCycled } = useCycle(landingCopy.titleVerbs.length, WORD_MS);

  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-14 pt-20 pb-24 sm:pt-28">
      <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-wide text-eyebrow uppercase">
            {landingCopy.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-5xl leading-[1.05] font-medium tracking-[-0.03em] sm:text-6xl xl:text-7xl"
          >
            <span className="sr-only">{landingCopy.titleAccessible}</span>
            <span aria-hidden className="block">
              {landingCopy.titleLead}
            </span>
            <span aria-hidden className="flex flex-wrap gap-x-[0.25em]">
              <RotatingWord word={landingCopy.titleVerbs[index]} shouldAnimate={hasCycled} />
              <span>{landingCopy.titleSuffix}</span>
            </span>
          </h1>
        </div>
        {aside}
      </div>
      <Showcase panels={panels} />
    </section>
  );
}
