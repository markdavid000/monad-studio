import { Check, Fuel, Hammer, LoaderCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NextStepBar } from "@/components/ui/next-step-bar";
import type { JourneyTool } from "@/hooks/use-send-contract";
import { journeyCopy } from "@/lib/copy";
import { monguardCopy, reviewFixesLabel } from "../copy";

interface NextStepProps {
  view: "findings" | "fixes";
  hasFix: boolean;
  isFixing: boolean;
  isAccepted: boolean;
  canAccept: boolean;
  chosenCount: number;
  onReviewFixes: () => void;
  onShowFixes: () => void;
  onAccept: () => void;
  onSend: (tool: JourneyTool) => void;
}

const copy = monguardCopy.fixes;

function statusOf(props: NextStepProps) {
  if (props.isAccepted) return copy.statusAccepted;
  if (props.hasFix && props.canAccept) return copy.statusReady;
  return copy.statusScanned;
}

export function NextStep(props: NextStepProps) {
  const isReviewing = props.view === "fixes" && props.canAccept;

  return (
    <NextStepBar
      label={journeyCopy.label}
      status={statusOf(props)}
      note={isReviewing ? copy.readyNote : undefined}
    >
      {props.view === "fixes" ? (
        <Button onClick={props.onAccept} disabled={!props.canAccept}>
          <Check aria-hidden />
          {copy.accept}
        </Button>
      ) : props.hasFix ? (
        <Button variant="outline" onClick={props.onShowFixes}>
          {copy.showFixes}
        </Button>
      ) : null}
      {props.view === "findings" ? (
        <Button onClick={props.onReviewFixes} disabled={props.chosenCount === 0 || props.isFixing}>
          {props.isFixing ? (
            <LoaderCircle aria-hidden className="animate-spin" />
          ) : (
            <Wrench aria-hidden />
          )}
          {props.isFixing ? copy.applying : reviewFixesLabel(props.chosenCount)}
        </Button>
      ) : null}
      <Button variant="outline" onClick={() => props.onSend("gaslens")}>
        <Fuel aria-hidden />
        {journeyCopy.gas}
      </Button>
      <Button variant="outline" onClick={() => props.onSend("forge")}>
        <Hammer aria-hidden />
        {journeyCopy.compile}
      </Button>
    </NextStepBar>
  );
}
