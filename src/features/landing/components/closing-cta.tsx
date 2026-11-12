import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ctaCopy } from "../copy";
import { TryScan } from "./try-scan";

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="flex flex-col items-start gap-7">
          <h2
            id="cta-title"
            className="text-5xl leading-[1.02] font-medium tracking-[-0.035em] text-balance sm:text-6xl xl:text-7xl"
          >
            {ctaCopy.title}
          </h2>
          <p className="text-xl text-muted-foreground">{ctaCopy.lead}</p>
          <Button
            asChild
            size="cta"
            className="group bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/studio">
              {ctaCopy.primary}
              <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <p className="font-mono text-xs text-muted-foreground">{ctaCopy.facts}</p>
        </div>
        <TryScan />
      </div>
    </section>
  );
}
