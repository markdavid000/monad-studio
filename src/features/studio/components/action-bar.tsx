import { ArrowRight, Fuel, Rocket, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toolBySlug } from "@/config/tools";
import { cn } from "@/lib/utils";
import { actionStatus, studioCopy } from "../copy";

const ACTIONS = [
  { key: "scan", icon: ShieldCheck, href: toolBySlug.monguard.href },
  { key: "optimise", icon: Fuel, href: toolBySlug.gaslens.href },
  { key: "deploy", icon: Rocket, href: toolBySlug.forge.href },
] as const;

const cardClass = "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left";

export function ActionBar() {
  return (
    <section aria-labelledby="actions-title" className="flex flex-col gap-3">
      <h2
        id="actions-title"
        className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
      >
        {studioCopy.actionsLabel}
      </h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {ACTIONS.map(({ key, icon: Icon, href }) => {
          const action = studioCopy.actions[key];
          const content = (
            <>
              <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-eyebrow" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium whitespace-nowrap">{action.label}</span>
                <span className="text-xs text-muted-foreground">
                  {href ? action.tool : actionStatus(action.tool)}
                </span>
              </span>
            </>
          );
          if (!href) {
            return (
              <button key={key} type="button" disabled className={cardClass}>
                {content}
              </button>
            );
          }
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "group transition-colors hover:border-eyebrow/60 hover:bg-muted/40",
                cardClass
              )}
            >
              {content}
              <ArrowRight
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{studioCopy.actionNote}</p>
    </section>
  );
}
