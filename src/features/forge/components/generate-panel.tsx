import { CircleAlert, CircleCheck, LoaderCircle, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { errorsTitle, forgeCopy } from "../copy";
import { PROMPT_MAX_LENGTH } from "../lib/schema";
import type { GeneratedContract } from "../types";
import { PanelCard } from "./panel-card";

interface GeneratePanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  generated: GeneratedContract | undefined;
  onGenerate: () => void;
  onShowResult: () => void;
}

const copy = forgeCopy.generate;

function LastWritten({ contract }: { contract: GeneratedContract }) {
  const { compile } = contract;
  const compiles = compile.status === "compiled";
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>{copy.lastLabel}</span>
      <span className="font-mono text-foreground">{contract.fileName}</span>
      <span
        className={cn(
          "flex items-center gap-1",
          compiles ? "text-success" : "text-severity-critical"
        )}
      >
        {compiles ? (
          <CircleCheck aria-hidden className="size-3.5" />
        ) : (
          <CircleAlert aria-hidden className="size-3.5" />
        )}
        {compiles ? copy.compiles : errorsTitle(compile.errors.length)}
      </span>
    </p>
  );
}

export function GeneratePanel(props: GeneratePanelProps) {
  return (
    <PanelCard step={1} titleId="generate-title" title={copy.heading} lead={copy.lead}>
      <div className="flex flex-col gap-2">
        <label htmlFor="forge-prompt" className="text-sm font-medium">
          {copy.label}
        </label>
        <textarea
          id="forge-prompt"
          value={props.prompt}
          onChange={(event) => props.onPromptChange(event.target.value)}
          maxLength={PROMPT_MAX_LENGTH}
          rows={4}
          placeholder={copy.placeholder}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {copy.examplesLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {copy.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => props.onPromptChange(example)}
              className="rounded-full border px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-eyebrow/60 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-3 border-t pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={props.onGenerate} disabled={!props.canGenerate}>
            {props.isGenerating ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <Sparkles aria-hidden />
            )}
            {props.isGenerating ? copy.running : copy.run}
          </Button>
          {props.generated ? (
            <Button variant="outline" onClick={props.onShowResult}>
              <PanelRightOpen aria-hidden />
              {copy.showResult}
            </Button>
          ) : null}
        </div>
        {props.generated ? <LastWritten contract={props.generated} /> : null}
        <p className="text-xs text-muted-foreground">{copy.note}</p>
      </div>
    </PanelCard>
  );
}
