import { describe, expect, it } from "vitest";
import { scanInputSchema, scanReplySchema, toScanReport } from "./schema";

const source = Array.from({ length: 30 }, (_, index) => `line ${index + 1}`).join("\n");

const finding = {
  severity: "low",
  title: " Missing event ",
  description: "No event on deposit.",
  impact: "Indexers miss deposits.",
  fix: "emit Deposit(msg.sender, msg.value);",
  fixCode: "",
  lines: [12],
} as const;

describe("scanReplySchema and toScanReport", () => {
  it("maps a valid reply, sorted by severity, with ids and a computed score", () => {
    const reply = scanReplySchema.parse({
      contractName: " VulnerableBank ",
      summary: "Two problems.",
      findings: [finding, { ...finding, severity: "critical", title: "Reentrancy in withdraw" }],
    });
    const report = toScanReport(reply, source);
    expect(report.contractName).toBe("VulnerableBank");
    expect(report.score).toBe(72);
    expect(report.findings.map((item) => [item.id, item.severity, item.title])).toEqual([
      ["MG-01", "critical", "Reentrancy in withdraw"],
      ["MG-02", "low", "Missing event"],
    ]);
  });

  it("drops line numbers outside the source and sorts the rest", () => {
    const reply = scanReplySchema.parse({
      contractName: "A",
      summary: "",
      findings: [{ ...finding, lines: [40, 3, 0, 3, 1.5, 2] }],
    });
    expect(toScanReport(reply, source).findings[0].lines).toEqual([2, 3]);
  });

  it("strips Markdown fences the model adds around the fix code", () => {
    const reply = scanReplySchema.parse({
      contractName: "A",
      summary: "",
      findings: [{ ...finding, fixCode: "```solidity\nuint256 x = 1;\n```" }],
    });
    expect(toScanReport(reply, source).findings[0].fixCode).toBe("uint256 x = 1;");
  });

  it("accepts a reply with no findings", () => {
    const reply = scanReplySchema.parse({ contractName: "A", summary: "Clean.", findings: [] });
    expect(toScanReport(reply, source)).toMatchObject({ score: 100, findings: [] });
  });

  it("rejects a partial reply", () => {
    const partial = Object.fromEntries(Object.entries(finding).filter(([key]) => key !== "fix"));
    expect(
      scanReplySchema.safeParse({ contractName: "A", summary: "", findings: [partial] }).success
    ).toBe(false);
  });

  it("rejects an unknown severity", () => {
    expect(
      scanReplySchema.safeParse({
        contractName: "A",
        summary: "",
        findings: [{ ...finding, severity: "severe" }],
      }).success
    ).toBe(false);
  });
});

describe("scanInputSchema", () => {
  it("accepts a contract", () => {
    expect(scanInputSchema.safeParse({ source: "contract A {}" }).success).toBe(true);
  });

  it("rejects an empty or blank source", () => {
    expect(scanInputSchema.safeParse({ source: "   " }).success).toBe(false);
    expect(scanInputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a source over 60 KB", () => {
    expect(scanInputSchema.safeParse({ source: "a".repeat(60 * 1024 + 1) }).success).toBe(false);
  });
});
