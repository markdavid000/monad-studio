import { z } from "zod";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { stripCodeFences } from "@/lib/code-text";

export const PROMPT_MIN_LENGTH = 10;
export const PROMPT_MAX_LENGTH = 2000;
const FILE_NAME_PATTERN = /^[A-Za-z0-9_-]{1,80}\.sol$/;

export const generateInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(PROMPT_MIN_LENGTH, "Describe the contract in a sentence or more.")
    .max(PROMPT_MAX_LENGTH, "Keep the description under 2000 characters."),
});

export const compileInputSchema = z.object({
  fileName: z.string().regex(FILE_NAME_PATTERN, "The file name must end in .sol."),
  source: z
    .string()
    .refine((source) => source.trim().length > 0, "Paste a contract first.")
    .refine((source) => byteSize(source) <= SOURCE_LIMIT_BYTES, "The contract is over 60 KB."),
});

export const generateReplySchema = z.object({
  contractName: z.string(),
  summary: z.string(),
  source: z.string(),
  notes: z.array(z.string()),
});

const abiParameterSchema = z.object({ name: z.string(), type: z.string() });

export const abiItemSchema = z.looseObject({
  type: z.string(),
  name: z.string().optional(),
  inputs: z.array(z.looseObject(abiParameterSchema.shape)).optional(),
  stateMutability: z.string().optional(),
});

const diagnosticSchema = z.object({
  severity: z.enum(["error", "warning"]),
  kind: z.string(),
  message: z.string(),
  line: z.number().optional(),
});

const compiledContractSchema = z.object({
  name: z.string(),
  abi: z.array(abiItemSchema),
  bytecode: z.string().regex(/^0x[0-9a-f]+$/),
  deployedSize: z.number(),
});

export const compileResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("compiled"),
    compilerVersion: z.string(),
    standardJsonInput: z.string(),
    contracts: z.array(compiledContractSchema),
    warnings: z.array(diagnosticSchema),
  }),
  z.object({
    status: z.literal("failed"),
    compilerVersion: z.string(),
    errors: z.array(diagnosticSchema),
    warnings: z.array(diagnosticSchema),
  }),
]);

export const generatedContractSchema = z.object({
  contractName: z.string(),
  fileName: z.string().regex(FILE_NAME_PATTERN),
  summary: z.string(),
  source: z.string(),
  notes: z.array(z.string()),
  compile: compileResultSchema,
});

export function toFileName(contractName: string) {
  const base = contractName.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
  return `${base || "Contract"}.sol`;
}

export function toGenerated(reply: z.infer<typeof generateReplySchema>) {
  const contractName = reply.contractName.trim();
  return {
    contractName,
    fileName: toFileName(contractName),
    summary: reply.summary.trim(),
    source: stripCodeFences(reply.source),
    notes: reply.notes.map((note) => note.replaceAll("`", "").trim()).filter(Boolean),
  };
}

export const forgeRunSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("generate"), contract: generatedContractSchema }),
  z.object({ kind: z.literal("compile"), fileName: z.string(), result: compileResultSchema }),
]);

export const errorFixReplySchema = z.object({
  fixedSource: z.string(),
  changes: z.array(z.object({ line: z.number(), note: z.string() })),
});

export const errorFixSchema = z.object({
  fixedSource: z.string(),
  changes: z.array(z.object({ line: z.number(), note: z.string() })),
  compile: compileResultSchema,
});
