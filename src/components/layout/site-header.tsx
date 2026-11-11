import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLink } from "./brand-link";
import { layoutCopy } from "./copy";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="page-container flex h-14 items-center justify-between">
        <BrandLink />
        <nav aria-label={layoutCopy.studio} className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            asChild
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/studio">{layoutCopy.openStudio}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
