import { CircleAlert, CircleCheck, ExternalLink, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addressUrl, shortHex, transactionUrl } from "@/lib/explorer";
import { forgeCopy } from "../copy";
import type { Deployment, Verification } from "../types";
import { CopyButton } from "./copy-button";

interface DeploymentCardProps {
  deployment: Deployment;
  verification: Verification | undefined;
  isVerifying: boolean;
  verificationFailed: boolean;
  onVerifyAgain: () => void;
  onCheck: () => void;
}

const copy = forgeCopy.deploy;
const verifyCopy = forgeCopy.verify;

function VerificationLine(props: DeploymentCardProps) {
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

export function DeploymentCard(props: DeploymentCardProps) {
  const { deployment } = props;
  return (
    <section
      aria-label={copy.deployedLabel}
      className="flex flex-col gap-4 rounded-xl border border-success/40 bg-success/5 px-4 py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          {copy.deployedLabel} <span className="font-mono">{deployment.contractName}</span>
        </h3>
        <a
          href={addressUrl(deployment.address)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copy.viewOnExplorer}
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </div>
      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">{copy.addressLabel}</dt>
        <dd className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="font-mono text-xs break-all">{deployment.address}</span>
          <CopyButton
            text={deployment.address}
            label={copy.copyAddress}
            copiedLabel={copy.copied}
          />
        </dd>
        <dt className="text-muted-foreground">{copy.txLabel}</dt>
        <dd>
          <a
            href={transactionUrl(deployment.txHash)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs underline-offset-2 hover:underline"
          >
            {shortHex(deployment.txHash)}
          </a>
        </dd>
        <dt className="text-muted-foreground">{verifyCopy.label}</dt>
        <dd className="min-w-0">
          <VerificationLine {...props} />
        </dd>
      </dl>
    </section>
  );
}
