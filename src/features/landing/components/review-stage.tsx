import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { reviewFlowCopy } from "../copy";
import { ReviewGraph } from "./review-graph";

interface LayerProps {
  isShown: boolean;
  children: ReactNode;
}

function Layer({ isShown, children }: LayerProps) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 right-0 flex w-[44%] items-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
        isShown ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
      )}
    >
      {children}
    </div>
  );
}

interface ReviewStageProps {
  step: number;
}

export function ReviewStage({ step }: ReviewStageProps) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={cn(
          "absolute inset-y-8 flex items-center transition-[left] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
          step >= 4 ? "-left-[14%]" : "left-[4%]"
        )}
      >
        <ReviewGraph step={step} />
      </div>
      <Layer isShown={step === 1}>
        <ul className="flex w-56 flex-col gap-1.5">
          {reviewFlowCopy.checklist.map((item, index) => (
            <li
              key={item}
              className={cn(
                "rounded border px-3 py-1 font-mono text-xs transition-[opacity,transform] duration-500",
                index === 0
                  ? "border-success bg-success text-background"
                  : "border-success/60 text-success",
                step === 1 ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
              )}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              {item}
            </li>
          ))}
        </ul>
      </Layer>
      <Layer isShown={step === 2}>
        <div className="w-64 rounded-lg border bg-card p-4 font-mono text-xs">
          <p className="mb-3 text-muted-foreground uppercase">{reviewFlowCopy.schemaTitle}</p>
          <ul className="flex flex-col gap-1.5">
            {reviewFlowCopy.schemaFields.map((field) => (
              <li key={field} className="flex items-center gap-2">
                <Check aria-hidden className="size-3.5 text-success" />
                <span>{field}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t pt-3 text-success">{reviewFlowCopy.schemaValid}</p>
        </div>
      </Layer>
      <Layer isShown={step === 3}>
        <div className="w-64 rounded-lg border bg-card p-4 font-mono text-sm">
          <p className="mb-3 text-xs text-muted-foreground uppercase">
            {reviewFlowCopy.scoreTitle}
          </p>
          <ul className="flex flex-col gap-1.5">
            {reviewFlowCopy.scoreRows.map((row, index) => (
              <li key={row.label} className="flex justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={index === 0 ? "" : "text-severity-critical"}>{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t pt-3 text-2xl text-severity-high">
            <span />
            <span>{reviewFlowCopy.scoreTotal}</span>
          </p>
        </div>
      </Layer>
      <Layer isShown={step === 4}>
        <ul className="flex w-72 flex-col gap-3">
          {reviewFlowCopy.nextTools.map((tool) => (
            <li key={tool.name} className="flex items-center gap-3">
              <ArrowRight aria-hidden className="size-4 shrink-0 text-eyebrow" />
              <div className="flex-1 rounded-lg border bg-card p-3">
                <p className="font-medium">{tool.name}</p>
                <p className="text-sm text-muted-foreground">{tool.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Layer>
    </div>
  );
}
