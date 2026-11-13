import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRecordRun } from "@/hooks/use-history";
import { showAiErrorToast } from "@/lib/ai-toast";
import { postJson } from "@/lib/api-error";
import { shortHex } from "@/lib/explorer";
import { toast } from "@/lib/toast";
import { forgeCopy, verifySummary } from "../copy";
import { EVM_VERSIONS, addressSchema, toFileName, verificationSchema } from "../lib/schema";
import type { ContractOutline } from "../lib/outline";
import { useVerification, verificationKey } from "./use-verification";

export const VERIFY_SLOT = "forge-verify";
const TOAST_ID = "forge-verify-source";
const copy = forgeCopy.verifySource;

type EvmVersion = (typeof EVM_VERSIONS)[number];

interface VerifySourceRequest {
  address: string;
  fileName: string;
  source: string;
  contractName: string;
  compilerVersion: string;
  optimizerEnabled: boolean;
  optimizerRuns: number;
  evmVersion: EvmVersion;
}

interface Draft {
  name: string;
  source: string;
  outline: ContractOutline;
}

function pragmaVersion(pragma: string | undefined) {
  return /\d+\.\d+\.\d+/.exec(pragma ?? "")?.[0] ?? "";
}

function isEvmVersion(value: string): value is EvmVersion {
  return EVM_VERSIONS.some((version) => version === value);
}

export function useVerifySource(draft: Draft, initialAddress = "") {
  const client = useQueryClient();
  const recordRun = useRecordRun("forge");
  const [typedAddress, setAddress] = useState<string>();
  const [contractName, setContractName] = useState<string>();
  const [compilerVersion, setCompilerVersion] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [optimizerEnabled, setOptimizerEnabled] = useState(false);
  const [runsText, setRunsText] = useState("200");
  const [evmVersion, setEvmVersion] = useState<EvmVersion>("default");

  const contracts = draft.outline.declarations
    .filter((item) => item.kind === "contract")
    .map((item) => item.name);
  const chosenContract = contractName ?? contracts.at(-1) ?? "";
  const chosenVersion = compilerVersion ?? pragmaVersion(draft.outline.pragma);
  const chosenFile = fileName ?? toFileName(draft.name.replace(/\.sol$/i, ""));
  const address = typedAddress ?? initialAddress;
  const trimmedAddress = address.trim();
  const isAddress = addressSchema.safeParse(trimmedAddress).success;
  const runs = Number(runsText);

  const submit = useMutation({
    mutationKey: ["forge", "verify-source"],
    mutationFn: (request: VerifySourceRequest) =>
      postJson("/api/forge/verify-source", request, verificationSchema),
    onSuccess: async (verification, request) => {
      const key = verificationKey(request.address);
      await client.cancelQueries({ queryKey: key });
      client.setQueryData(key, verification);
      recordRun(
        {
          fileName: request.fileName,
          contractName: request.contractName,
          summary: verifySummary(request.address),
          source: request.source,
          report: {
            kind: "verify",
            fileName: request.fileName,
            contractName: request.contractName,
            address: request.address,
            compilerVersion: request.compilerVersion,
          },
        },
        VERIFY_SLOT
      );
      toast.success(copy.submittedTitle, { id: TOAST_ID, description: shortHex(request.address) });
    },
    onError: (error, request) => {
      showAiErrorToast(error, {
        id: TOAST_ID,
        title: copy.failedTitle,
        onRetry: () => submit.mutate(request),
      });
    },
  });

  const verification = useVerification(isAddress ? trimmedAddress : undefined, submit.isPending);
  const isRunsValid = Number.isInteger(runs) && runs >= 0;

  return {
    address,
    setAddress,
    isAddress,
    contracts,
    contractName: chosenContract,
    setContractName,
    compilerVersion: chosenVersion,
    setCompilerVersion,
    fileName: chosenFile,
    setFileName,
    optimizerEnabled,
    setOptimizerEnabled,
    runsText,
    setRunsText,
    evmVersion,
    setEvmVersion: (value: string) => {
      if (isEvmVersion(value)) setEvmVersion(value);
    },
    canSubmit:
      isAddress &&
      chosenContract !== "" &&
      chosenVersion !== "" &&
      draft.source.trim() !== "" &&
      isRunsValid &&
      !submit.isPending,
    isSubmitting: submit.isPending,
    submitFailed: submit.isError,
    verification: verification.data,
    isChecking: verification.isFetching,
    check: () => verification.refetch(),
    submit: () =>
      submit.mutate({
        address: trimmedAddress,
        fileName: chosenFile,
        source: draft.source,
        contractName: chosenContract,
        compilerVersion: chosenVersion,
        optimizerEnabled,
        optimizerRuns: runs,
        evmVersion,
      }),
  };
}
