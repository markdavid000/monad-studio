import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { toolBySlug } from "@/config/tools";
import { demoCopy } from "../copy";

export const metadata: Metadata = { title: demoCopy.title, description: demoCopy.description };

const demoTools = [
  { tool: toolBySlug.monguard, href: "/demo/monguard" },
  { tool: toolBySlug.gaslens, href: "/demo/gaslens" },
] as const;

export default function DemoPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-[-0.02em]">{demoCopy.title}</h1>
        <p className="text-muted-foreground">{demoCopy.lead}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {demoTools.map(({ tool, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/25"
            >
              <span className="flex items-center justify-between font-medium">
                {tool.name}
                <ArrowRight
                  aria-hidden
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-sm text-muted-foreground">{tool.summary}</span>
              <span className="text-sm">{tool.output}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
