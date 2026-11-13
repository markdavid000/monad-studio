import { BadgeCheck, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { forgeCopy } from "../copy";
import type { useVerifySource } from "../hooks/use-verify-source";
import { EVM_VERSIONS } from "../lib/schema";
import type { ContractOutline } from "../lib/outline";
import { PanelCard } from "./panel-card";
import { VerificationStatus } from "./verification-status";
import { WorkspaceSummary } from "./workspace-summary";

interface VerifyPanelProps {
  form: ReturnType<typeof useVerifySource>;
  fileName: string;
  source: string;
  outline: ContractOutline;
  isTooLarge: boolean;
}

const copy = forgeCopy.verifySource;
const fieldClass =
  "w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function VerifyPanel({ form, ...props }: VerifyPanelProps) {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2">
      <PanelCard step={1} titleId="verify-title" title={copy.heading} lead={copy.lead}>
        <Field id="verify-address" label={copy.addressLabel}>
          <input
            id="verify-address"
            value={form.address}
            onChange={(event) => form.setAddress(event.target.value)}
            placeholder="0x"
            spellCheck={false}
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="verify-contract" label={copy.contractLabel}>
            <NativeSelect
              id="verify-contract"
              value={form.contractName}
              onChange={(event) => form.setContractName(event.target.value)}
              disabled={form.contracts.length === 0}
              className={fieldClass}
            >
              {form.contracts.length === 0 ? <option value="">{copy.noContracts}</option> : null}
              {form.contracts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="verify-version" label={copy.versionLabel}>
            <input
              id="verify-version"
              value={form.compilerVersion}
              onChange={(event) => form.setCompilerVersion(event.target.value)}
              placeholder="0.8.28"
              spellCheck={false}
              aria-describedby="verify-version-hint"
              className={fieldClass}
            />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">{copy.versionHint}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="verify-file" label={copy.fileLabel}>
            <input
              id="verify-file"
              value={form.fileName}
              onChange={(event) => form.setFileName(event.target.value)}
              spellCheck={false}
              className={fieldClass}
            />
          </Field>
          <Field id="verify-runs" label={copy.runsLabel}>
            <input
              id="verify-runs"
              value={form.runsText}
              onChange={(event) => form.setRunsText(event.target.value)}
              inputMode="numeric"
              disabled={!form.optimizerEnabled}
              className={cn(fieldClass, "disabled:opacity-50")}
            />
          </Field>
          <Field id="verify-evm" label={copy.evmLabel}>
            <NativeSelect
              id="verify-evm"
              value={form.evmVersion}
              onChange={(event) => form.setEvmVersion(event.target.value)}
              className={fieldClass}
            >
              {EVM_VERSIONS.map((version) => (
                <option key={version} value={version}>
                  {version === "default" ? copy.evmDefault : version}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.optimizerEnabled}
            onChange={(event) => form.setOptimizerEnabled(event.target.checked)}
            className="size-4 accent-[var(--eyebrow)]"
          />
          {copy.optimizerLabel}
        </label>
        <p className="text-xs text-muted-foreground">{copy.fileHint}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t pt-4">
          <Button onClick={form.submit} disabled={!form.canSubmit}>
            {form.isSubmitting ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <BadgeCheck aria-hidden />
            )}
            {form.isSubmitting ? copy.running : copy.run}
          </Button>
        </div>
      </PanelCard>
      <PanelCard
        step={2}
        titleId="verify-source-title"
        title={copy.sourceHeading}
        lead={copy.sourceLead}
      >
        <WorkspaceSummary
          fileName={props.fileName}
          source={props.source}
          outline={props.outline}
          isTooLarge={props.isTooLarge}
        />
        <div className="mt-auto flex flex-col gap-2 border-t pt-4" aria-live="polite">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {copy.statusLabel}
          </p>
          {form.isAddress ? (
            <VerificationStatus
              verification={form.verification}
              isVerifying={form.isSubmitting || (form.isChecking && !form.verification)}
              verificationFailed={form.submitFailed}
              onVerifyAgain={form.submit}
              onCheck={form.check}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{copy.enterAddress}</p>
          )}
        </div>
      </PanelCard>
    </div>
  );
}
