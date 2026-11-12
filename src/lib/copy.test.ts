import { describe, expect, it } from "vitest";
import { findingsCount, linesLabel, retryIn } from "./copy";

describe("linesLabel", () => {
  it("is empty without lines", () => {
    expect(linesLabel([])).toBe("");
  });

  it("names a single line", () => {
    expect(linesLabel([7])).toBe("Line 7");
  });

  it("joins consecutive lines into ranges", () => {
    expect(linesLabel([16, 17, 18, 19, 20])).toBe("Lines 16 to 20");
    expect(linesLabel([3, 5, 6, 9])).toBe("Lines 3, 5 to 6, 9");
  });
});

describe("findingsCount", () => {
  it("pluralises", () => {
    expect(findingsCount(0)).toBe("0 findings");
    expect(findingsCount(1)).toBe("1 finding");
    expect(findingsCount(3)).toBe("3 findings");
  });
});

describe("retryIn", () => {
  it("rounds up to whole minutes", () => {
    expect(retryIn(30)).toBe("Try again in a minute.");
    expect(retryIn(61)).toBe("Try again in 2 minutes.");
  });
});
