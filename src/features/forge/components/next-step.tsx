import { FileInput, Fuel, Hammer, ShieldCheck } from "lucide-react";
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
  onSend: (tool: JourneyTool) => void;
}

export function CompiledNextStep({ isCompiled, onSend }: CompiledNextStepProps) {
  const copy = forgeCopy.compile;
  return (
    <NextStepBar
      label={journeyCopy.label}
      status={isCompiled ? copy.statusCompiled : copy.statusFailed}
    >
      <SendButtons onSend={onSend} />
    </NextStepBar>
  );
}
