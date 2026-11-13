import "server-only";
import type { z } from "zod";
import type { verifySourceInputSchema } from "../lib/schema";
import type { Verification } from "../types";
import { fullCompilerVersion } from "./compilers";
import { submitVerification } from "./sourcify";

type VerifySourceInput = z.infer<typeof verifySourceInputSchema>;

export async function verifySource(input: VerifySourceInput): Promise<Verification> {
  const compilerVersion = await fullCompilerVersion(input.compilerVersion);
  if (!compilerVersion) {
    return {
      status: "failed",
      message: `Solidity ${input.compilerVersion} is not a released compiler version.`,
    };
  }
  const standardJsonInput = JSON.stringify({
    language: "Solidity",
    sources: { [input.fileName]: { content: input.source } },
    settings: {
      optimizer: { enabled: input.optimizerEnabled, runs: input.optimizerRuns },
      ...(input.evmVersion === "default" ? {} : { evmVersion: input.evmVersion }),
      outputSelection: { "*": { "*": ["abi"] } },
    },
  });
  return submitVerification({
    address: input.address,
    standardJsonInput,
    compilerVersion,
    contractIdentifier: `${input.fileName}:${input.contractName}`,
  });
}
