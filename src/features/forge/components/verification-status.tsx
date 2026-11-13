import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forgeCopy } from "../copy";
import type { Verification } from "../types";

const verifyCopy = forgeCopy.verify;

interface VerificationStatusProps {
  verification: Verification | undefined;
  isVerifying: boolean;
  verificationFailed: boolean;
  onVerifyAgain: () => void;
  onCheck: () => void;
}

export function VerificationStatus(props: VerificationStatusProps) {
  const { verification } = props;
  if (verification?.status === "verified") {
    return (
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-sm text-success">
          <CircleCheck aria-hidden className="size-4" />
          {verification.match === "exact_match" ? verifyCopy.exact : verifyCopy.partial}
        </p>
        {verification.match === "match" ? (
          <p className="text-xs text-muted-foreground">{verifyCopy.partialNote}</p>
        ) : null}
      </div>
    );
  }
  if (verification?.status === "pending" || (props.isVerifying && !verification)) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          {verification ? verifyCopy.pending : verifyCopy.submitting}
        </p>
        {verification && !props.isVerifying ? (
          <>
            <span className="text-xs text-muted-foreground">{verifyCopy.pendingSlow}</span>
            <Button size="sm" variant="outline" onClick={props.onCheck}>
              {verifyCopy.check}
            </Button>
          </>
        ) : null}
      </div>
    );
  }
  const message =
    verification?.status === "failed"
      ? verification.message
      : props.verificationFailed
        ? verifyCopy.submitFailed
        : undefined;
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm text-severity-critical">
        <CircleAlert aria-hidden className="size-4" />
        {verification?.status === "unverified" && !message
          ? verifyCopy.unverified
          : verifyCopy.failed}
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button size="sm" variant="outline" className="self-start" onClick={props.onVerifyAgain}>
        {verifyCopy.retry}
      </Button>
    </div>
  );
}
