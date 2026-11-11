import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingCopy } from "../copy";
import { step } from "../lib/step";
import { ClientPreview } from "./client-preview";
import { Scene } from "./scene";

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
    <Scene className="py-20 sm:py-24">
      <section aria-labelledby={`${id}-title`} className="flex flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-4">
          <p
            data-step
            style={step(0)}
            className="font-mono text-xs tracking-wide text-eyebrow uppercase"
          >
            {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            data-step
            style={step(1)}
            className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
          >
            {title}
          </h2>
          <p data-step style={step(2)} className="text-lg text-muted-foreground">
            {lead}
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
          <div
            data-step
            style={step(3)}
            className={cn(
              "relative min-h-[22rem] overflow-hidden rounded-xl p-3 sm:p-8",
              tone === "warm" ? "bg-frame-warm" : "bg-frame-sand"
            )}
          >
            <ClientPreview>{children}</ClientPreview>
            <div aria-hidden className="color-bar absolute inset-x-0 bottom-0 h-1 opacity-80" />
          </div>
          <div className="flex flex-col gap-7 lg:pt-4">
            {points.map((point, index) => (
              <div
                key={point.title}
                data-step
                style={step(5 + index * 2)}
                className="flex flex-col gap-1.5 border-l-2 border-transparent pl-4 transition-colors hover:border-eyebrow"
              >
                <h3 className="font-medium">{point.title}</h3>
                <p className="text-muted-foreground">{point.body}</p>
              </div>
            ))}
            {href ? (
              <Button asChild variant="outline" className="group self-start">
                <Link href={href}>
                  {landingCopy.openTool} {toolName}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </Scene>
  );
}
