import Link from "next/link";
import { isLinked, tools } from "@/config/tools";
import { BrandLink } from "./brand-link";
import { layoutCopy } from "./copy";
import { ThemeToggle } from "./theme-toggle";

export function StudioHeader() {
  const linkedTools = tools.filter(isLinked);

  return (
    <header className="border-b">
      <div className="page-container flex h-14 items-center gap-6">
        <BrandLink />
        <nav aria-label={layoutCopy.tools} className="flex flex-1 items-center gap-4 text-sm">
          {linkedTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {tool.name}
            </Link>
          ))}
        </nav>
        <span className="text-sm text-muted-foreground">{layoutCopy.network}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
