import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toolCopy } from "@/config/copy";
import { connectUrl } from "@/lib/studio-entry";
import { BrandLink } from "./brand-link";
import { layoutCopy } from "./copy";
import { DemoNav } from "./demo-nav";
import { ThemeToggle } from "./theme-toggle";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center gap-x-3 px-4 lg:px-6">
        <BrandLink />
        <ChevronRight aria-hidden className="hidden size-4 text-muted-foreground/50 sm:block" />
        <Link
          href="/demo"
          className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
        >
          {layoutCopy.demo}
        </Link>
        <DemoNav
          label={layoutCopy.demoNav}
          links={[
            { href: "/demo/monguard", label: toolCopy.monguard.name },
            { href: "/demo/gaslens", label: toolCopy.gaslens.name },
          ]}
        />
        <div className="ml-auto flex h-14 items-center gap-2">
          <Button asChild size="sm">
            <Link href={connectUrl("/studio")}>{layoutCopy.connectWallet}</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <p className="border-t bg-muted/40 px-4 py-2 text-sm text-muted-foreground lg:px-6">
        {layoutCopy.demoBanner}
      </p>
    </header>
  );
}
