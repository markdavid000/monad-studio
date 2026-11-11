import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingCopy } from "../copy";

interface ToolSectionPoint {
  title: string;
  body: string;
}

interface ToolSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  points: readonly ToolSectionPoint[];
  tone: "warm" | "sand";
  toolName: string;
  href?: string;
  children: ReactNode;
}

export function ToolSection({
  id,
  eyebrow,
  title,
  lead,
  points,
  tone,
  toolName,
  href,
  children,
}: ToolSectionProps) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-10 py-20 sm:py-24">
      <div className="flex max-w-2xl flex-col gap-4">
        <p className="font-mono text-xs tracking-wide text-eyebrow uppercase">{eyebrow}</p>
        <h2 id={`${id}-title`} className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground">{lead}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        <div
          className={cn(
            "rounded-xl p-3 sm:p-8",
            tone === "warm" ? "bg-frame-warm" : "bg-frame-sand"
          )}
        >
          {children}
        </div>
        <div className="flex flex-col gap-7 lg:pt-4">
          {points.map((point) => (
            <div key={point.title} className="flex flex-col gap-1.5">
              <h3 className="font-medium">{point.title}</h3>
              <p className="text-muted-foreground">{point.body}</p>
            </div>
          ))}
          {href ? (
            <Button asChild variant="outline" className="self-start">
              <Link href={href}>
                {landingCopy.openTool} {toolName}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
