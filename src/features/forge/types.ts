import type { z } from "zod";
import type {
  compileResultSchema,
  deploymentSchema,
  errorFixSchema,
  forgeRunSchema,
  generatedContractSchema,
  verificationSchema,
  verifyInputSchema,
} from "./lib/schema";

export type CompileResult = z.infer<typeof compileResultSchema>;
export type CompiledContract = Extract<CompileResult, { status: "compiled" }>["contracts"][number];
export type Diagnostic = CompileResult["warnings"][number];
export type AbiItem = CompiledContract["abi"][number];
export type GeneratedContract = z.infer<typeof generatedContractSchema>;
export type ForgeRun = z.infer<typeof forgeRunSchema>;
export type ErrorFix = z.infer<typeof errorFixSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type VerifyInput = z.infer<typeof verifyInputSchema>;
export type Deployment = z.infer<typeof deploymentSchema>;
