import type { z } from "zod";
import type { fixInputSchema, fixResultSchema, scanReportSchema } from "./lib/schema";

export type ScanReport = z.infer<typeof scanReportSchema>;
export type Finding = ScanReport["findings"][number];
export type FixInput = z.infer<typeof fixInputSchema>;
export type FixResult = z.infer<typeof fixResultSchema>;
