import Link from "next/link";
import { siteLinks } from "@/config/site";
import { layoutCopy } from "./copy";
import { FooterWordmark } from "./footer-wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-16 overflow-hidden md:mt-20">
      <div className="page-container flex flex-col gap-8 pt-16 pb-8">
        <FooterWordmark />
        <div className="flex flex-col gap-4 border-t pt-8 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label={layoutCopy.footerLinksLabel} className="flex gap-9">
            <Link href="/studio" className="transition-colors hover:text-foreground">
              {layoutCopy.studio}
            </Link>
            <a href={siteLinks.github} className="transition-colors hover:text-foreground">
              {layoutCopy.github}
            </a>
          </nav>
          <p className="text-sm">{layoutCopy.footerNote}</p>
          <p>{layoutCopy.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
