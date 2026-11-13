import { describe, expect, it } from "vitest";
import { connectUrl, safeStudioPath } from "./studio-entry";

describe("safeStudioPath", () => {
  it("keeps studio paths and replaces anything else with the workspace", () => {
    expect(safeStudioPath("/studio/monguard?run=1")).toBe("/studio/monguard?run=1");
    expect(safeStudioPath("/studio")).toBe("/studio");
    for (const bad of [
      null,
      "",
      "/",
      "https://evil.example/studio",
      "//evil.example",
      "/studios",
      "/api/history",
    ]) {
      expect(safeStudioPath(bad)).toBe("/studio");
    }
  });

  it("builds the connect link", () => {
    expect(connectUrl("/studio/activity")).toBe("/?connect=1&next=%2Fstudio%2Factivity");
  });
});
