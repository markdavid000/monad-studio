import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLink } from "./brand-link";
import { layoutCopy } from "./copy";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <BrandLink />
        <nav aria-label={layoutCopy.studio} className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/studio">{layoutCopy.openStudio}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
