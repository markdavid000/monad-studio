import { z } from "zod";
import { SOURCE_LIMIT_BYTES, byteSize } from "@/lib/byte-size";
import { stripCodeFences } from "@/lib/code-text";
import { SEVERITIES, compareSeverity, securityScore } from "@/lib/severity";
import type { ScanReport } from "../types";

export const scanInputSchema = z.object({
  source: z
    .string()
    .refine((source) => source.trim().length > 0, "Paste a contract first.")
    .refine((source) => byteSize(source) <= SOURCE_LIMIT_BYTES, "The contract is over 60 KB."),
});

const findingFields = {
  severity: z.enum(SEVERITIES),
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  fix: z.string(),
  fixCode: z.string(),
  lines: z.array(z.number()),
};

export const scanReplySchema = z.object({
  contractName: z.string(),
  summary: z.string(),
  findings: z.array(z.object(findingFields)),
});

export const scanReportSchema = z.object({
  contractName: z.string(),
  summary: z.string(),
  score: z.number(),
  findings: z.array(z.object({ id: z.string(), ...findingFields })),
});

type ScanReply = z.infer<typeof scanReplySchema>;

function validLines(lines: readonly number[], lineCount: number) {
  const inRange = lines.filter((line) => Number.isInteger(line) && line >= 1 && line <= lineCount);
  return [...new Set(inRange)].sort((a, b) => a - b);
}

export function toScanReport(reply: ScanReply, source: string): ScanReport {
  const lineCount = source.split("\n").length;
  const findings = [...reply.findings]
    .sort((a, b) => compareSeverity(a.severity, b.severity))
    .map((finding, index) => ({
      id: `MG-${String(index + 1).padStart(2, "0")}`,
      severity: finding.severity,
      title: finding.title.trim(),
      description: finding.description.trim(),
      impact: finding.impact.trim(),
      fix: finding.fix.trim(),
      fixCode: stripCodeFences(finding.fixCode),
      lines: validLines(finding.lines, lineCount),
    }));

  return {
    contractName: reply.contractName.trim(),
    summary: reply.summary.trim(),
    score: securityScore(findings.map((finding) => finding.severity)),
    findings,
  };
}

const FIX_LIMIT = 20;

export const fixInputSchema = z.object({
  source: scanInputSchema.shape.source,
  findings: z
    .array(
      z.object({
        id: z.string().max(20),
        title: z.string().max(300),
        fix: z.string().max(2000),
        fixCode: z.string().max(8000),
        lines: z.array(z.number()).max(200),
      })
    )
    .min(1, "Pick at least one fix.")
    .max(FIX_LIMIT, "Pick at most 20 fixes."),
});

export const fixReplySchema = z.object({
  fixedSource: z.string(),
  applied: z.array(z.object({ id: z.string(), note: z.string() })),
  skipped: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export const fixResultSchema = z.object({
  fixedSource: z.string(),
  applied: z.array(z.object({ id: z.string(), note: z.string() })),
  skipped: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export const monguardRunSchema = z.union([
  scanReportSchema,
  z.object({ kind: z.literal("fix"), scan: scanReportSchema, fix: fixResultSchema }),
]);

export function toFixResult(
  reply: z.infer<typeof fixReplySchema>,
  source: string,
  requestedIds: readonly string[]
): z.infer<typeof fixResultSchema> {
  const requested = new Set(requestedIds);
  const fixedSource = stripCodeFences(reply.fixedSource) || source;
  const unchanged = fixedSource.trim() === source.trim();
  const applied = unchanged
    ? []
    : reply.applied
        .filter((item) => requested.has(item.id))
        .map((item) => ({ id: item.id, note: item.note.replaceAll("`", "").trim() }));
  const appliedIds = new Set(applied.map((item) => item.id));
  const skipped = [...requested]
    .filter((id) => !appliedIds.has(id))
    .map((id) => ({
      id,
      reason: (reply.skipped.find((item) => item.id === id)?.reason ?? "")
        .replaceAll("`", "")
        .trim(),
    }));
  return { fixedSource: unchanged ? source : fixedSource, applied, skipped };
}
