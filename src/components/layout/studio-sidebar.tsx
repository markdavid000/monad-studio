"use client";

import { Eye, Fuel, GitBranch, Hammer, LayoutGrid, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools, type Tool } from "@/config/tools";
import { StatusRail } from "@/features/studio";
import { cn } from "@/lib/utils";
import { layoutCopy } from "./copy";

const ICONS: Record<Tool["slug"], typeof ShieldCheck> = {
  monguard: ShieldCheck,
  gaslens: Fuel,
  forge: Hammer,
  sentinel: Eye,
  paradebug: GitBranch,
};

const itemClass = "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <div className="shrink-0 border-b lg:sticky lg:top-14 lg:flex lg:h-[calc(100dvh-3.5rem)] lg:w-80 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0">
      <nav
        aria-label={layoutCopy.studioNav}
        className="flex gap-1 overflow-x-auto px-4 py-2 lg:flex-col lg:overflow-visible lg:px-4 lg:py-5"
      >
        <Link
          href="/studio"
          aria-current={pathname === "/studio" ? "page" : undefined}
          className={cn(
            itemClass,
            pathname === "/studio"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <LayoutGrid aria-hidden className="size-4" />
          {layoutCopy.workspace}
        </Link>
        <p className="mt-4 mb-1 hidden px-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase lg:block">
          {layoutCopy.tools}
        </p>
        {tools.map((tool) => {
          const Icon = ICONS[tool.slug];
          if (!tool.href) {
            return (
              <span
                key={tool.slug}
                className={cn(itemClass, "cursor-default text-muted-foreground/70")}
              >
                <Icon aria-hidden className="size-4" />
                <span className="flex-1 whitespace-nowrap">{tool.name}</span>
                <span className="rounded-full border px-1.5 font-mono text-[10px]">
                  {layoutCopy.soon}
                </span>
              </span>
            );
          }
          const isActive = pathname.startsWith(tool.href);
          return (
            <Link
              key={tool.slug}
              href={tool.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                itemClass,
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon aria-hidden className="size-4" />
              {tool.name}
            </Link>
          );
        })}
      </nav>
      <div className="hidden px-4 pb-5 lg:mt-auto lg:block">
        <StatusRail />
      </div>
    </div>
  );
}
