import { ExternalLink } from "lucide-react";
import { addressUrl, shortHex, transactionUrl } from "@/lib/explorer";
import { forgeCopy } from "../copy";
import type { Deployment, Verification } from "../types";
import { CopyButton } from "./copy-button";
import { VerificationStatus } from "./verification-status";

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
          <VerificationStatus
            verification={props.verification}
            isVerifying={props.isVerifying}
            verificationFailed={props.verificationFailed}
            onVerifyAgain={props.onVerifyAgain}
            onCheck={props.onCheck}
          />
        </dd>
      </dl>
    </section>
  );
}
