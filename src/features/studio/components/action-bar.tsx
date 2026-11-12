import { Fuel, Rocket, ShieldCheck } from "lucide-react";
import { actionStatus, studioCopy } from "../copy";

const ACTIONS = [
  { key: "scan", icon: ShieldCheck },
  { key: "optimise", icon: Fuel },
  { key: "deploy", icon: Rocket },
] as const;

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
        {ACTIONS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            disabled
            className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left"
          >
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-eyebrow" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium whitespace-nowrap">{studioCopy.actions[key].label}</span>
              <span className="text-xs text-muted-foreground">
                {actionStatus(studioCopy.actions[key].tool)}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{studioCopy.actionNote}</p>
    </section>
  );
}
