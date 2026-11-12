import { describe, expect, it } from "vitest";
import { analyseInputSchema, gasReplySchema, toGasReport } from "./schema";

const source = Array.from({ length: 20 }, (_, index) => `line ${index + 1}`).join("\n");

const item = {
  impact: "low",
  title: " Use calldata ",
  description: "Arrays are copied to memory.",
  estimatedGas: 120.6,
  per: "call",
  lines: [4],
} as const;

describe("gasReplySchema and toGasReport", () => {
  it("sorts by impact then savings, numbers the findings and rounds gas", () => {
    const reply = gasReplySchema.parse({
      contractName: " GasHeavy ",
      summary: "Three wins.",
      optimizedSource: "```solidity\ncontract GasHeavy {}\n```",
      optimizations: [
        item,
        { ...item, impact: "high", title: "Cache length", estimatedGas: 500 },
        { ...item, impact: "high", title: "Cache owner", estimatedGas: 2100 },
      ],
    });
    const report = toGasReport(reply, source);
    expect(report.contractName).toBe("GasHeavy");
    expect(report.optimizedSource).toBe("contract GasHeavy {}");
    expect(report.optimizations.map((o) => [o.id, o.title, o.estimatedGas])).toEqual([
      ["GL-01", "Cache owner", 2100],
      ["GL-02", "Cache length", 500],
      ["GL-03", "Use calldata", 121],
    ]);
  });

  it("clamps negative estimates and line numbers outside the source", () => {
    const reply = gasReplySchema.parse({
      contractName: "A",
      summary: "",
      optimizedSource: source,
      optimizations: [{ ...item, estimatedGas: -40, lines: [0, 3, 3, 99] }],
    });
    expect(toGasReport(reply, source).optimizations[0]).toMatchObject({
      estimatedGas: 0,
      lines: [3],
    });
  });

  it("keeps the original source when the model returns an empty rewrite", () => {
    const reply = gasReplySchema.parse({
      contractName: "A",
      summary: "Already tight.",
      optimizedSource: "  ",
      optimizations: [],
    });
    expect(toGasReport(reply, source)).toMatchObject({
      optimizedSource: source,
      optimizations: [],
    });
  });

  it("rejects a partial reply and an unknown scope", () => {
    expect(
      gasReplySchema.safeParse({ contractName: "A", summary: "", optimizations: [] }).success
    ).toBe(false);
    expect(
      gasReplySchema.safeParse({
        contractName: "A",
        summary: "",
        optimizedSource: "",
        optimizations: [{ ...item, per: "block" }],
      }).success
    ).toBe(false);
  });
});

describe("analyseInputSchema", () => {
  it("rejects empty and oversized sources", () => {
    expect(analyseInputSchema.safeParse({ source: " " }).success).toBe(false);
    expect(analyseInputSchema.safeParse({ source: "a".repeat(60 * 1024 + 1) }).success).toBe(false);
    expect(analyseInputSchema.safeParse({ source: "contract A {}" }).success).toBe(true);
  });
});
