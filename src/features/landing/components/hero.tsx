import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { landingCopy } from "../copy";

interface HeroProps {
  showcase: ReactNode;
}

export function Hero({ showcase }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-14 pt-20 pb-24 sm:pt-28">
      <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-wide text-eyebrow uppercase">
            {landingCopy.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-5xl leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-6xl"
          >
            {landingCopy.title}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-5">
          <p className="text-lg text-muted-foreground">{landingCopy.lead}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href="/studio">
                {landingCopy.cta}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#tools">{landingCopy.secondaryCta}</Link>
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{landingCopy.noWallet}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-muted/30 p-4 sm:p-6">{showcase}</div>
    </section>
  );
}
