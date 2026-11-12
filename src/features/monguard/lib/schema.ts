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
