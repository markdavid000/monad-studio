import { Check, FileInput, Fuel, Hammer, LoaderCircle, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextStepBar } from "@/components/ui/next-step-bar";
import type { JourneyTool } from "@/hooks/use-send-contract";
import { journeyCopy } from "@/lib/copy";
import { forgeCopy } from "../copy";

interface WrittenNextStepProps {
  isInWorkspace: boolean;
  onUse: () => void;
  onCompile: () => void;
  onSend: (tool: JourneyTool) => void;
}

function SendButtons({ onSend }: { onSend: (tool: JourneyTool) => void }) {
  return (
    <>
      <Button variant="outline" onClick={() => onSend("monguard")}>
        <ShieldCheck aria-hidden />
        {journeyCopy.scan}
      </Button>
      <Button variant="outline" onClick={() => onSend("gaslens")}>
        <Fuel aria-hidden />
        {journeyCopy.gas}
      </Button>
    </>
  );
}

export function WrittenNextStep(props: WrittenNextStepProps) {
  const copy = forgeCopy.generate;
  return (
    <NextStepBar
      label={journeyCopy.label}
      status={props.isInWorkspace ? copy.statusInWorkspace : copy.statusWritten}
    >
      <Button onClick={props.onUse} disabled={props.isInWorkspace}>
        <FileInput aria-hidden />
        {copy.use}
      </Button>
      <SendButtons onSend={props.onSend} />
      <Button variant="outline" onClick={props.onCompile}>
        <Hammer aria-hidden />
        {copy.compileNow}
      </Button>
    </NextStepBar>
  );
}

interface CompiledNextStepProps {
  isCompiled: boolean;
  view: "result" | "fixes";
  hasFix: boolean;
  isSuggesting: boolean;
  onSuggest: () => void;
  onShowFix: () => void;
  onAcceptFix: () => void;
  onSend: (tool: JourneyTool) => void;
}

export function CompiledNextStep(props: CompiledNextStepProps) {
  const copy = forgeCopy.compile;
  const isReviewing = props.view === "fixes";
  return (
    <NextStepBar
      label={journeyCopy.label}
      status={
        isReviewing ? copy.fixes.status : props.isCompiled ? copy.statusCompiled : copy.statusFailed
      }
      note={isReviewing ? copy.fixes.note : undefined}
    >
      {isReviewing ? (
        <Button onClick={props.onAcceptFix}>
          <Check aria-hidden />
          {copy.fixes.accept}
        </Button>
      ) : null}
      {!isReviewing && props.hasFix ? (
        <Button variant="outline" onClick={props.onShowFix}>
          {copy.fixes.show}
        </Button>
      ) : null}
      {!isReviewing && !props.isCompiled ? (
        <Button onClick={props.onSuggest} disabled={props.isSuggesting}>
          {props.isSuggesting ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Wrench aria-hidden />
          )}
          {props.isSuggesting ? copy.fixes.suggesting : copy.fixes.suggest}
        </Button>
      ) : null}
      <SendButtons onSend={props.onSend} />
    </NextStepBar>
  );
}
