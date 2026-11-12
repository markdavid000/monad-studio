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

type ToolSectionLayout = "frame-left" | "frame-right" | "wide" | "side" | "cards";

interface ToolSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  points: readonly ToolSectionPoint[];
  tone: "warm" | "sand";
  layout: ToolSectionLayout;
  toolName: string;
  href?: string;
  children: ReactNode;
}

interface HeaderProps {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  className?: string;
  leadClassName?: string;
}

function Header({ id, eyebrow, title, lead, className, leadClassName }: HeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
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
        className="text-3xl font-medium tracking-[-0.02em] text-balance sm:text-4xl"
      >
        {title}
      </h2>
      <p data-step style={step(2)} className={cn("text-lg text-muted-foreground", leadClassName)}>
        {lead}
      </p>
    </div>
  );
}

interface FrameProps {
  tone: "warm" | "sand";
  className?: string;
  children: ReactNode;
}

function Frame({ tone, className, children }: FrameProps) {
  return (
    <div
      data-step
      style={step(3)}
      className={cn(
        "relative min-h-[22rem] overflow-hidden rounded-xl p-3 sm:p-8",
        tone === "warm" ? "bg-frame-warm" : "bg-frame-sand",
        className
      )}
    >
      <ClientPreview>{children}</ClientPreview>
      <div aria-hidden className="color-bar absolute inset-x-0 bottom-0 h-1 opacity-80" />
    </div>
  );
}

interface PointsProps {
  points: readonly ToolSectionPoint[];
  variant: "list" | "numbered" | "columns" | "cards";
}

function Points({ points, variant }: PointsProps) {
  return (
    <ul
      className={cn(
        variant === "list" && "flex flex-col gap-7",
        variant === "numbered" && "flex flex-col gap-6",
        variant === "columns" && "grid gap-8 border-t pt-8 md:grid-cols-3",
        variant === "cards" && "grid gap-3 md:grid-cols-3"
      )}
    >
      {points.map((point, index) => (
        <li
          key={point.title}
          data-step
          style={step(5 + index * 2)}
          className={cn(
            "flex gap-4 transition-colors",
            variant === "list" && "border-l-2 border-transparent pl-4 hover:border-eyebrow",
            variant === "cards" && "rounded-xl border bg-card/60 p-5 hover:border-eyebrow/50"
          )}
        >
          {variant === "numbered" ? (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs text-eyebrow">
              {index + 1}
            </span>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium">{point.title}</h3>
            <p className="text-muted-foreground">{point.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface ToolLinkProps {
  href?: string;
  toolName: string;
}

function ToolLink({ href, toolName }: ToolLinkProps) {
  if (!href) return null;
  return (
    <Button asChild variant="outline" className="group self-start">
      <Link href={href}>
        {landingCopy.openTool} {toolName}
        <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}

export function ToolSection({
  id,
  eyebrow,
  title,
  lead,
  points,
  tone,
  layout,
  toolName,
  href,
  children,
}: ToolSectionProps) {
  const header = { id, eyebrow, title, lead };

  return (
    <Scene className="py-20 sm:py-24">
      <section aria-labelledby={`${id}-title`} className="flex flex-col gap-10">
        {layout === "frame-left" ? (
          <>
            <Header {...header} className="max-w-2xl" />
            <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
              <Frame tone={tone}>{children}</Frame>
              <div className="flex flex-col gap-7 lg:pt-4">
                <Points points={points} variant="list" />
                <ToolLink href={href} toolName={toolName} />
              </div>
            </div>
          </>
        ) : null}
        {layout === "frame-right" ? (
          <>
            <Header {...header} className="max-w-2xl" />
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
              <div className="order-2 flex flex-col gap-7 lg:order-1 lg:pt-4">
                <Points points={points} variant="numbered" />
                <ToolLink href={href} toolName={toolName} />
              </div>
              <Frame tone={tone} className="order-1 lg:order-2">
                {children}
              </Frame>
            </div>
          </>
        ) : null}
        {layout === "wide" ? (
          <>
            <Header {...header} className="max-w-2xl" />
            <Frame tone={tone}>{children}</Frame>
            <Points points={points} variant="columns" />
            <ToolLink href={href} toolName={toolName} />
          </>
        ) : null}
        {layout === "side" ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div className="flex flex-col gap-10 lg:sticky lg:top-24 lg:self-start">
              <Header {...header} />
              <Points points={points} variant="list" />
              <ToolLink href={href} toolName={toolName} />
            </div>
            <Frame tone={tone}>{children}</Frame>
          </div>
        ) : null}
        {layout === "cards" ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
              <Header {...header} leadClassName="lg:hidden" />
              <p
                data-step
                style={step(2)}
                className="hidden text-lg text-muted-foreground lg:block"
              >
                {lead}
              </p>
            </div>
            <Frame tone={tone}>{children}</Frame>
            <Points points={points} variant="cards" />
            <ToolLink href={href} toolName={toolName} />
          </>
        ) : null}
      </section>
    </Scene>
  );
}
