import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ctaCopy } from "../copy";
import { step } from "../lib/step";
import { Scene } from "./scene";

export function ClosingCta() {
  return (
    <Scene className="pt-14 md:pt-20">
      <section
        aria-labelledby="cta-title"
        className="relative isolate overflow-hidden rounded-2xl border bg-card px-6 py-16 sm:px-12 lg:py-24"
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:3rem_3rem]"
        />
        <div
          aria-hidden
          className="glow-drift absolute -bottom-1/2 left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-eyebrow/25 blur-[120px]"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col items-start gap-6">
            <p
              data-step
              style={step(0)}
              className="rounded-full border border-eyebrow/40 bg-eyebrow/10 px-3 py-1 font-mono text-xs text-eyebrow"
            >
              {ctaCopy.eyebrow}
            </p>
            <h2
              id="cta-title"
              data-step
              style={step(1)}
              className="text-4xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl xl:text-6xl"
            >
              {ctaCopy.title}
            </h2>
            <p data-step style={step(2)} className="max-w-xl text-lg text-muted-foreground">
              {ctaCopy.lead}
            </p>
            <div data-step style={step(3)} className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="cta-button group h-12 rounded-lg px-7 text-base">
                <Link href="/studio">
                  {ctaCopy.primary}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 text-base">
                <Link href="#review-flow-title">{ctaCopy.secondary}</Link>
              </Button>
            </div>
          </div>
          <Link
            href="/studio"
            data-step
            style={step(4)}
            aria-label={ctaCopy.primary}
            className="group block rounded-xl border bg-background/80 shadow-2xl shadow-eyebrow/10 backdrop-blur transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-eyebrow/60"
          >
            <span className="flex items-center gap-3 border-b px-4 py-2.5 font-mono text-xs text-muted-foreground">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              </span>
              <span className="text-foreground">{ctaCopy.editorFile}</span>
            </span>
            <span className="block p-5 font-mono text-sm leading-7">
              {ctaCopy.editorLines.map((line, index) => (
                <span key={`${index}-${line}`} className="block min-h-7 text-muted-foreground">
                  {line}
                </span>
              ))}
              <span className="block pl-4 text-foreground/70">
                {ctaCopy.editorHint}
                <span
                  aria-hidden
                  className="caret ml-0.5 inline-block h-5 w-2 translate-y-1 bg-eyebrow"
                />
              </span>
            </span>
            <span className="flex justify-end border-t px-4 py-3">
              <span className="inline-flex items-center gap-2 rounded-md bg-eyebrow px-4 py-1.5 text-sm font-medium text-primary-foreground transition-transform group-hover:scale-105">
                {ctaCopy.editorAction}
                <ArrowRight aria-hidden className="size-4" />
              </span>
            </span>
          </Link>
        </div>
      </section>
    </Scene>
  );
}
