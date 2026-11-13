import { describe, expect, it } from "vitest";
import { parseArgs, parseMonValue } from "./args";

describe("parseArgs", () => {
  it("turns form text into the types the ABI asks for, numbers as bigint", () => {
    const { args, isValid } = parseArgs(
      [
        { name: "owner", type: "address" },
        { name: "cap", type: "uint256" },
        { name: "delta", type: "int8" },
        { name: "open", type: "bool" },
        { name: "name", type: "string" },
        { name: "salt", type: "bytes32" },
        { name: "holders", type: "address[]" },
      ],
      {
        owner: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        cap: "1000000000000000000000000",
        delta: "-128",
        open: "true",
        name: "Monad Gold",
        salt: `0x${"11".repeat(32)}`,
        holders: '["0x70997970c51812dc3a010c7d01b50e0d17dc79c8"]',
      }
    );
    expect(isValid).toBe(true);
    expect(args).toEqual([
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      1_000_000_000_000_000_000_000_000n,
      -128n,
      true,
      "Monad Gold",
      `0x${"11".repeat(32)}`,
      ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
    ]);
  });

  it("names each field that is wrong", () => {
    const { errors, isValid } = parseArgs(
      [
        { name: "owner", type: "address" },
        { name: "cap", type: "uint8" },
        { name: "fee", type: "uint256" },
        { name: "list", type: "uint256[2]" },
        { name: "point", type: "tuple" },
      ],
      { owner: "alice", cap: "256", fee: "1.5", list: "[1]", point: "{}" }
    );
    expect(isValid).toBe(false);
    expect(errors).toEqual({
      owner: "Enter a 0x address.",
      cap: "Out of range for uint8.",
      fee: "Enter a whole number.",
      list: "Enter exactly 2 items.",
      point: "tuple is not supported yet.",
    });
  });

  it("is valid with no constructor arguments", () => {
    expect(parseArgs([], {})).toEqual({ args: [], errors: {}, isValid: true });
  });
});

describe("parseMonValue", () => {
  it("reads MON into wei and rejects anything else", () => {
    expect(parseMonValue("")).toEqual({ value: 0n });
    expect(parseMonValue("0.5")).toEqual({ value: 500_000_000_000_000_000n });
    expect(parseMonValue("-1")).toEqual({ error: "Enter an amount of MON, like 0.5." });
    expect(parseMonValue("1e18")).toHaveProperty("error");
  });
});
