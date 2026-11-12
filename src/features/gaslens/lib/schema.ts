import { z } from "zod";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { stripCodeFences } from "@/lib/code-text";
import type { GasReport } from "../types";

export const IMPACTS = ["high", "medium", "low"] as const;
export const SAVING_SCOPES = ["call", "deployment", "iteration"] as const;

export const analyseInputSchema = z.object({
  source: z
    .string()
    .refine((source) => source.trim().length > 0, "Paste a contract first.")
    .refine((source) => byteSize(source) <= SOURCE_LIMIT_BYTES, "The contract is over 60 KB."),
});

const optimizationFields = {
  impact: z.enum(IMPACTS),
  title: z.string(),
  description: z.string(),
  estimatedGas: z.number(),
  per: z.enum(SAVING_SCOPES),
  lines: z.array(z.number()),
};

export const gasReplySchema = z.object({
  contractName: z.string(),
  summary: z.string(),
  optimizedSource: z.string(),
  optimizations: z.array(z.object(optimizationFields)),
});

export const gasReportSchema = z.object({
  contractName: z.string(),
  summary: z.string(),
  optimizedSource: z.string(),
  optimizations: z.array(z.object({ id: z.string(), ...optimizationFields })),
});

type GasReply = z.infer<typeof gasReplySchema>;

function validLines(lines: readonly number[], lineCount: number) {
  const inRange = lines.filter((line) => Number.isInteger(line) && line >= 1 && line <= lineCount);
  return [...new Set(inRange)].sort((a, b) => a - b);
}

export function toGasReport(reply: GasReply, source: string): GasReport {
  const lineCount = source.split("\n").length;
  const optimizations = reply.optimizations
    .map((item) => ({ ...item, estimatedGas: Math.max(0, Math.round(item.estimatedGas)) }))
    .sort(
      (a, b) =>
        IMPACTS.indexOf(a.impact) - IMPACTS.indexOf(b.impact) || b.estimatedGas - a.estimatedGas
    )
    .map((item, index) => ({
      id: `GL-${String(index + 1).padStart(2, "0")}`,
      impact: item.impact,
      title: item.title.trim(),
      description: item.description.trim(),
      estimatedGas: item.estimatedGas,
      per: item.per,
      lines: validLines(item.lines, lineCount),
    }));
  const optimizedSource = stripCodeFences(reply.optimizedSource);

  return {
    contractName: reply.contractName.trim(),
    summary: reply.summary.trim(),
    optimizedSource: optimizedSource || source,
    optimizations,
  };
}
