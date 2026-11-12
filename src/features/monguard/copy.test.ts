import { describe, expect, it } from "vitest";
import { linesLabel } from "./copy";

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
