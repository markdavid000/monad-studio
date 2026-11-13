import { Hammer, LoaderCircle, PanelRightOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ToolActions } from "@/components/ui/tool-actions";
import { forgeCopy } from "../copy";
import { SourceCode } from "./source-code";

interface CompilePanelProps {
  fileName: string;
  source: string;
  isEmpty: boolean;
  isTooLarge: boolean;
  isCompiling: boolean;
  hasResult: boolean;
  onCompile: () => void;
  onShowResult: () => void;
}

const copy = forgeCopy.compile;

function runLabel(isCompiling: boolean, hasResult: boolean) {
  if (isCompiling) return copy.running;
  return hasResult ? copy.rerun : copy.run;
}

export function CompilePanel(props: CompilePanelProps) {
  return (
    <section aria-labelledby="compile-title" className="flex flex-col gap-4">
      <h2 id="compile-title" className="text-xl font-medium">
        {copy.heading}
      </h2>
      {props.isEmpty ? (
        <EmptyState
          title={copy.emptyTitle}
          body={copy.emptyBody}
          action={
            <Button asChild>
              <Link href="/studio">{copy.openWorkspace}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SourceCode
            label={copy.codeLabel}
            fileName={props.fileName}
            source={props.source}
            canEdit
          />
          <ToolActions
            note={copy.note}
            tooLarge={
              props.isTooLarge
                ? { message: copy.tooLarge, editLabel: copy.editInWorkspace }
                : undefined
            }
          >
            <Button size="lg" onClick={props.onCompile} disabled={props.isCompiling}>
              {props.isCompiling ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <Hammer aria-hidden />
              )}
              {runLabel(props.isCompiling, props.hasResult)}
            </Button>
            {props.hasResult ? (
              <Button size="lg" variant="outline" onClick={props.onShowResult}>
                <PanelRightOpen aria-hidden />
                {copy.showResults}
              </Button>
            ) : null}
          </ToolActions>
        </>
      )}
    </section>
  );
}
