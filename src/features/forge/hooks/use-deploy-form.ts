import { useState } from "react";
import { parseArgs, parseMonValue, type AbiInput } from "../lib/args";
import { constructorOf } from "../lib/abi";
import type { CompiledContract } from "../types";

export function inputKey(input: AbiInput, index: number) {
  return input.name || String(index);
}

export function useDeployForm(contracts: readonly CompiledContract[]) {
  const [chosenName, setChosenName] = useState<string>();
  const [valuesByContract, setValuesByContract] = useState<Record<string, Record<string, string>>>(
    {}
  );
  const [valueText, setValueText] = useState("");
  const [hasAttempted, setAttempted] = useState(false);

  const contract = contracts.find((item) => item.name === chosenName) ?? contracts.at(-1);
  const constructor = contract ? constructorOf(contract.abi) : undefined;
  const inputs: AbiInput[] = (constructor?.inputs ?? []).map((input) => ({
    name: input.name,
    type: input.type,
  }));
  const isPayable = constructor?.stateMutability === "payable";
  const values = contract ? (valuesByContract[contract.name] ?? {}) : {};
  const parsed = parseArgs(inputs, values);
  const mon = isPayable ? parseMonValue(valueText) : { value: 0n };

  const errors: Record<string, string> = {};
  inputs.forEach((input, index) => {
    const key = inputKey(input, index);
    const error = parsed.errors[key];
    if (error && (hasAttempted || (values[key] ?? "") !== "")) errors[key] = error;
  });
  const valueError = "error" in mon && (hasAttempted || valueText !== "") ? mon.error : undefined;

  return {
    contracts,
    contract,
    inputs,
    isPayable,
    values,
    errors,
    valueText,
    valueError,
    chooseContract: (name: string) => {
      setChosenName(name);
      setAttempted(false);
    },
    setValue: (key: string, text: string) => {
      if (!contract) return;
      setValuesByContract({
        ...valuesByContract,
        [contract.name]: { ...values, [key]: text },
      });
    },
    setValueText,
    request: () => {
      setAttempted(true);
      if (!contract || !parsed.isValid || "error" in mon) return undefined;
      return { contract, inputs, args: parsed.args, value: mon.value };
    },
  };
}
