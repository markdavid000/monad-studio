import { z } from "zod";
import { SOURCE_LIMIT_BYTES, byteSize } from "./byte-size";
import { HISTORY_TOOLS } from "./history";

const REPORT_LIMIT_BYTES = 200 * 1024;
export const SYNC_BATCH = 5;

export const historyMetaSchema = z.object({
  id: z.uuid(),
  tool: z.enum(HISTORY_TOOLS),
  createdAt: z.int().nonnegative(),
  fileName: z.string().max(200),
  contractName: z.string().max(200),
  summary: z.string().max(300),
});

export const historyRunSchema = historyMetaSchema.extend({
  source: z.string().refine((source) => byteSize(source) <= SOURCE_LIMIT_BYTES),
  report: z.json().refine((report) => byteSize(JSON.stringify(report)) <= REPORT_LIMIT_BYTES),
});

export type HistoryMeta = z.infer<typeof historyMetaSchema>;
