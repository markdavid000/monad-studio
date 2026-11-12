import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingCopy } from "../copy";

export function HeroAside() {
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="text-lg text-muted-foreground">{landingCopy.lead}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          size="cta"
          className="group bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href="/studio">
            {landingCopy.cta}
            <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="#tools">{landingCopy.secondaryCta}</Link>
        </Button>
      </div>
    </div>
  );
}
