import { describe, expect, it } from "vitest";
import { compareSeverity, securityScore, type Severity } from "./severity";

describe("securityScore", () => {
  it("is 100 with no findings", () => {
    expect(securityScore([])).toBe(100);
  });

  it("subtracts the weight of each severity", () => {
    expect(securityScore(["critical"])).toBe(75);
    expect(securityScore(["high"])).toBe(85);
    expect(securityScore(["medium"])).toBe(92);
    expect(securityScore(["low"])).toBe(97);
    expect(securityScore(["info"])).toBe(99);
    expect(securityScore(["critical", "high", "medium", "low", "info"])).toBe(48);
  });

  it("never goes below zero", () => {
    expect(securityScore(["critical", "critical", "critical", "critical", "high"])).toBe(0);
  });
});

describe("compareSeverity", () => {
  it("orders the most severe first", () => {
    const mixed: Severity[] = ["info", "critical", "low", "high", "medium"];
    expect(mixed.sort(compareSeverity)).toEqual(["critical", "high", "medium", "low", "info"]);
  });
});
