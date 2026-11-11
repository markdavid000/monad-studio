import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingCopy } from "../copy";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="flex flex-col items-start gap-6 py-20">
      <h1 id="hero-title" className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {landingCopy.title}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{landingCopy.lead}</p>
      <Button asChild size="lg">
        <Link href="/studio">{landingCopy.cta}</Link>
      </Button>
    </section>
  );
}
