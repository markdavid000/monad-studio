import { describe, expect, it } from "vitest";
import { numberLines, stripCodeFences } from "./code-text";

describe("stripCodeFences", () => {
  it("removes a fenced block with or without a language", () => {
    expect(stripCodeFences("```solidity\nuint256 x;\n```")).toBe("uint256 x;");
    expect(stripCodeFences("```\nuint256 x;\n```")).toBe("uint256 x;");
  });

  it("leaves plain code alone", () => {
    expect(stripCodeFences("  uint256 x;\n")).toBe("uint256 x;");
  });
});

describe("numberLines", () => {
  it("prefixes each line with its number", () => {
    expect(numberLines("a\n\nb")).toBe("1| a\n2| \n3| b");
  });
});
