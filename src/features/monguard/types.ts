import type { z } from "zod";
import type { scanReportSchema } from "./lib/schema";

export type ScanReport = z.infer<typeof scanReportSchema>;
export type Finding = ScanReport["findings"][number];
