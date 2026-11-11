import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteLinks } from "@/config/site";
import { layoutCopy } from "./copy";
import { FooterWordmark } from "./footer-wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 overflow-hidden">
      <div className="page-container flex flex-col gap-10 pb-10">
        <FooterWordmark />
        <div className="grid items-center gap-6 border p-6 sm:p-8 lg:grid-cols-[auto_auto_1fr] lg:gap-10">
          <p className="text-lg font-medium text-eyebrow">{layoutCopy.footerPrompt}</p>
          <Button
            asChild
            size="lg"
            className="group self-start bg-foreground text-background hover:bg-foreground/90 lg:self-auto"
          >
            <Link href="/studio">
              {layoutCopy.openStudio}
              <ArrowRight
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">{layoutCopy.footerNote}</p>
        </div>
        <div className="flex flex-col gap-4 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label={layoutCopy.footerLinksLabel} className="flex gap-8">
            <Link href="/studio" className="transition-colors hover:text-foreground">
              {layoutCopy.studio}
            </Link>
            <a href={siteLinks.github} className="transition-colors hover:text-foreground">
              {layoutCopy.github}
            </a>
          </nav>
          <p>{layoutCopy.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
