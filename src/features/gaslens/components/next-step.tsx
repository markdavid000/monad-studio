import { Check, Hammer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextStepBar } from "@/components/ui/next-step-bar";
import type { JourneyTool } from "@/hooks/use-send-contract";
import { journeyCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import type { RewriteCheck } from "../types";

interface NextStepProps {
  hasChanges: boolean;
  check: RewriteCheck;
  isAccepted: boolean;
  canAccept: boolean;
  onAccept: () => void;
  onSend: (tool: JourneyTool) => void;
}

const copy = gaslensCopy.journey;

function statusOf(props: NextStepProps) {
  if (!props.hasChanges) return copy.statusUnchanged;
  if (props.isAccepted) return copy.statusAccepted;
  return props.check.status === "clear" ? copy.statusReady : copy.statusReviewed;
}

function noteOf(props: NextStepProps) {
  if (!props.hasChanges || props.isAccepted) return undefined;
  if (props.check.status === "flagged") return copy.flaggedNote;
  if (props.check.status === "unavailable") return copy.unavailableNote;
  return copy.readyNote;
}

export function NextStep(props: NextStepProps) {
  return (
    <NextStepBar label={journeyCopy.label} status={statusOf(props)} note={noteOf(props)}>
      {props.hasChanges ? (
        <Button onClick={props.onAccept} disabled={!props.canAccept}>
          <Check aria-hidden />
          {copy.accept}
        </Button>
      ) : null}
      <Button variant="outline" onClick={() => props.onSend("monguard")}>
        <ShieldCheck aria-hidden />
        {journeyCopy.scan}
      </Button>
      <Button variant="outline" onClick={() => props.onSend("forge")}>
        <Hammer aria-hidden />
        {journeyCopy.compile}
      </Button>
    </NextStepBar>
  );
}
