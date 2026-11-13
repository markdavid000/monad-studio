import type { z } from "zod";
import type {
  compileResultSchema,
  errorFixSchema,
  forgeRunSchema,
  generatedContractSchema,
} from "./lib/schema";

export type CompileResult = z.infer<typeof compileResultSchema>;
export type CompiledContract = Extract<CompileResult, { status: "compiled" }>["contracts"][number];
export type Diagnostic = CompileResult["warnings"][number];
export type AbiItem = CompiledContract["abi"][number];
export type GeneratedContract = z.infer<typeof generatedContractSchema>;
export type ForgeRun = z.infer<typeof forgeRunSchema>;
export type ErrorFix = z.infer<typeof errorFixSchema>;
