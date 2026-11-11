import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingCopy } from "../copy";

export function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-title"
      className="my-20 flex flex-col items-start gap-6 rounded-xl border bg-muted/30 p-8 sm:p-12"
    >
      <h2
        id="closing-title"
        className="max-w-xl text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
      >
        {landingCopy.closingTitle}
      </h2>
      <p className="max-w-2xl text-muted-foreground">{landingCopy.closingLead}</p>
      <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
        <Link href="/studio">
          {landingCopy.cta}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </section>
  );
}
