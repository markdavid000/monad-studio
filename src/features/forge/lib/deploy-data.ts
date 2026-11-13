import { concatHex, encodeAbiParameters, parseAbiParameters, type Hex } from "viem";
import type { AbiInput } from "./args";

export function deployData(
  bytecode: Hex,
  inputs: readonly AbiInput[],
  args: readonly unknown[]
): Hex {
  if (inputs.length === 0) return bytecode;
  const params = parseAbiParameters(
    inputs.map((input) => (input.name ? `${input.type} ${input.name}` : input.type)).join(", ")
  );
  return concatHex([bytecode, encodeAbiParameters(params, args)]);
}
