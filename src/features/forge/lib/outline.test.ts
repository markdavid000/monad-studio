import { describe, expect, it } from "vitest";
import { outlineOf } from "./outline";

describe("outlineOf", () => {
  it("reads the pragma and every top level declaration in order", () => {
    const source = [
      "// SPDX-License-Identifier: MIT",
      "pragma solidity ^0.8.24;",
      "interface IToken { function go() external; }",
      "library Maths {}",
      "abstract contract Base {}",
      "contract Vault is Base {",
      "  // contract Fake {}",
      "}",
    ].join("\n");
    expect(outlineOf(source)).toEqual({
      pragma: "^0.8.24",
      declarations: [
        { kind: "interface", name: "IToken" },
        { kind: "library", name: "Maths" },
        { kind: "contract", name: "Base" },
        { kind: "contract", name: "Vault" },
      ],
    });
  });

  it("copes with a source that has neither", () => {
    expect(outlineOf("hello")).toEqual({ pragma: undefined, declarations: [] });
  });
});
