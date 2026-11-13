import { LoaderCircle, PanelRightOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forgeCopy } from "../copy";
import { PROMPT_MAX_LENGTH } from "../lib/schema";

interface GeneratePanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  hasResult: boolean;
  onGenerate: () => void;
  onShowResult: () => void;
}

const copy = forgeCopy.generate;

export function GeneratePanel(props: GeneratePanelProps) {
  return (
    <section aria-labelledby="generate-title" className="flex flex-col gap-4">
      <h2 id="generate-title" className="text-xl font-medium">
        {copy.heading}
      </h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="forge-prompt" className="text-sm font-medium">
          {copy.label}
        </label>
        <textarea
          id="forge-prompt"
          value={props.prompt}
          onChange={(event) => props.onPromptChange(event.target.value)}
          maxLength={PROMPT_MAX_LENGTH}
          rows={3}
          placeholder={copy.placeholder}
          className="w-full resize-y rounded-xl border bg-card px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {copy.examplesLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {copy.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => props.onPromptChange(example)}
              className="rounded-full border px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-eyebrow/60 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button size="lg" onClick={props.onGenerate} disabled={!props.canGenerate}>
          {props.isGenerating ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Sparkles aria-hidden />
          )}
          {props.isGenerating ? copy.running : copy.run}
        </Button>
        {props.hasResult ? (
          <Button size="lg" variant="outline" onClick={props.onShowResult}>
            <PanelRightOpen aria-hidden />
            {copy.showResult}
          </Button>
        ) : null}
        <p className="text-sm text-muted-foreground">{copy.note}</p>
      </div>
    </section>
  );
}
