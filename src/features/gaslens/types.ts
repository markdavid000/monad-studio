import type { z } from "zod";
import type { gasReportSchema } from "./lib/schema";

export type GasReport = z.infer<typeof gasReportSchema>;
export type Optimization = GasReport["optimizations"][number];
export type RewriteCheck = GasReport["check"];
