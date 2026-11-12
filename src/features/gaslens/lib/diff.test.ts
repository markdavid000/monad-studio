import { describe, expect, it } from "vitest";
import { diffLines } from "./diff";

function kinds(before: string, after: string) {
  return diffLines(before, after).map((line) => `${line.kind[0]} ${line.text}`);
}

describe("diffLines", () => {
  it("marks every line the same when nothing changed", () => {
    const lines = diffLines("a\nb\nc", "a\nb\nc");
    expect(lines.every((line) => line.kind === "same")).toBe(true);
    expect(lines.map((line) => [line.oldNumber, line.newNumber])).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  it("finds added lines and numbers them on the new side", () => {
    const lines = diffLines("a\nc", "a\nb\nc");
    expect(lines.map((line) => line.kind)).toEqual(["same", "add", "same"]);
    expect(lines[1]).toEqual({ kind: "add", text: "b", newNumber: 2 });
    expect(lines[2]).toMatchObject({ oldNumber: 2, newNumber: 3 });
  });

  it("finds removed lines and numbers them on the old side", () => {
    const lines = diffLines("a\nb\nc", "a\nc");
    expect(lines[1]).toEqual({ kind: "remove", text: "b", oldNumber: 2 });
  });

  it("shows a replaced line as a removal followed by an addition", () => {
    expect(kinds("a\nx = 0;\nc", "a\nx = 1;\nc")).toEqual(["s a", "r x = 0;", "a x = 1;", "s c"]);
  });

  it("ignores trailing whitespace changes", () => {
    expect(kinds("a  \nb", "a\nb")).toEqual(["s a", "s b"]);
  });

  it("handles a 400 line contract with scattered edits quickly", () => {
    const before = Array.from({ length: 400 }, (_, index) => `line ${index}`);
    const after = before.map((line, index) => (index % 40 === 0 ? `${line} changed` : line));
    after.splice(200, 0, "inserted");
    const started = performance.now();
    const lines = diffLines(before.join("\n"), after.join("\n"));
    expect(performance.now() - started).toBeLessThan(200);
    expect(lines.filter((line) => line.kind === "remove")).toHaveLength(10);
    expect(lines.filter((line) => line.kind === "add")).toHaveLength(11);
    expect(lines.filter((line) => line.kind === "same")).toHaveLength(390);
  });
});
