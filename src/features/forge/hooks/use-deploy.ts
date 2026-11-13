import { useIsMutating, useMutation } from "@tanstack/react-query";
import { BaseError, UserRejectedRequestError, type Hex } from "viem";
import { monadTestnet } from "viem/chains";
import { useConfig } from "wagmi";
import { sendTransaction, waitForTransactionReceipt } from "wagmi/actions";
import { useRecordRun } from "@/hooks/use-history";
import { shortHex } from "@/lib/explorer";
import { toast } from "@/lib/toast";
import { deployedSummary, forgeCopy } from "../copy";
import type { AbiInput } from "../lib/args";
import { deployData } from "../lib/deploy-data";
import type { CompileResult, Deployment } from "../types";

const MUTATION_KEY = ["forge", "deploy"];
const TOAST_ID = "forge-deploy";
export const DEPLOY_SLOT = "forge-deploy";
const copy = forgeCopy.deploy;

export interface DeployRequest {
  fileName: string;
  source: string;
  result: Extract<CompileResult, { status: "compiled" }>;
  contractName: string;
  bytecode: Hex;
  inputs: readonly AbiInput[];
  args: readonly unknown[];
  value: bigint;
}

class RevertedError extends Error {}

function isRejected(error: Error) {
  return (
    error instanceof BaseError &&
    error.walk((cause) => cause instanceof UserRejectedRequestError) !== null
  );
}

function failureMessage(error: Error) {
  if (error instanceof RevertedError) return copy.reverted;
  return error instanceof BaseError ? error.shortMessage : error.message;
}

export function useDeploy(onDeployed: (deployment: Deployment, request: DeployRequest) => void) {
  const config = useConfig();
  const recordRun = useRecordRun("forge");
  const runningCount = useIsMutating({ mutationKey: MUTATION_KEY });
  const mutation = useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: async (request: DeployRequest): Promise<Deployment> => {
      const hash = await sendTransaction(config, {
        chainId: monadTestnet.id,
        data: deployData(request.bytecode, request.inputs, request.args),
        value: request.value,
      });
      toast.loading(copy.pendingTitle, { id: TOAST_ID, description: copy.pendingBody });
      const receipt = await waitForTransactionReceipt(config, { chainId: monadTestnet.id, hash });
      if (receipt.status !== "success" || !receipt.contractAddress) throw new RevertedError();
      return { contractName: request.contractName, address: receipt.contractAddress, txHash: hash };
    },
    onMutate: () => {
      toast.loading(copy.confirmTitle, { id: TOAST_ID });
    },
    onSuccess: (deployment, request) => {
      recordRun(
        {
          fileName: request.fileName,
          contractName: deployment.contractName,
          summary: deployedSummary(deployment.address),
          source: request.source,
          report: {
            kind: "deploy",
            fileName: request.fileName,
            result: request.result,
            deployment,
          },
        },
        DEPLOY_SLOT
      );
      toast.success(copy.doneTitle, { id: TOAST_ID, description: shortHex(deployment.address) });
      onDeployed(deployment, request);
    },
    onError: (error) => {
      if (isRejected(error)) {
        toast.info(copy.cancelledTitle, { id: TOAST_ID, description: copy.cancelledBody });
        return;
      }
      console.error(error);
      toast.error(copy.failedTitle, { id: TOAST_ID, description: failureMessage(error) });
    },
  });

  return {
    isRunning: runningCount > 0,
    deployment: mutation.data,
    request: mutation.variables,
    deploy: mutation.mutate,
  };
}
