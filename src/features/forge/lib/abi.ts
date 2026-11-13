import type { AbiItem } from "../types";

export function signature(item: AbiItem) {
  const params = (item.inputs ?? [])
    .map((input) => (input.name ? `${input.type} ${input.name}` : input.type))
    .join(", ");
  return `${item.name ?? item.type}(${params})`;
}

export function constructorOf(abi: readonly AbiItem[]) {
  return abi.find((item) => item.type === "constructor");
}

export function functionsOf(abi: readonly AbiItem[]) {
  return abi.filter((item) => item.type === "function");
}
