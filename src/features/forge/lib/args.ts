import { getAddress, isAddress, isHex, parseEther } from "viem";

export interface AbiInput {
  name: string;
  type: string;
}

type ParsedValue = string | bigint | boolean | readonly ParsedValue[];

type Parsed = { ok: true; value: ParsedValue } | { ok: false; error: string };

const ARRAY = /^(.*)\[(\d*)\]$/;
const INTEGER = /^(u?)int(\d*)$/;
const FIXED_BYTES = /^bytes(\d+)$/;

function fail(error: string): Parsed {
  return { ok: false, error };
}

function parseInteger(raw: unknown, type: string): Parsed {
  const match = INTEGER.exec(type);
  const text = typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.trim() : "";
  if (!match || !/^-?\d+$/.test(text)) return fail("Enter a whole number.");
  const value = BigInt(text);
  const bits = BigInt(match[2] || "256");
  const isUnsigned = match[1] === "u";
  const max = isUnsigned ? 2n ** bits - 1n : 2n ** (bits - 1n) - 1n;
  const min = isUnsigned ? 0n : -(2n ** (bits - 1n));
  if (value < min || value > max) return fail(`Out of range for ${type}.`);
  return { ok: true, value };
}

function parseScalar(raw: unknown, type: string): Parsed {
  if (type === "address") {
    const text = typeof raw === "string" ? raw.trim() : "";
    return isAddress(text, { strict: false })
      ? { ok: true, value: getAddress(text) }
      : fail("Enter a 0x address.");
  }
  if (type === "bool") {
    if (raw === true || raw === "true") return { ok: true, value: true };
    if (raw === false || raw === "false") return { ok: true, value: false };
    return fail("Enter true or false.");
  }
  if (type === "string")
    return typeof raw === "string" ? { ok: true, value: raw } : fail("Enter text.");
  if (INTEGER.test(type)) return parseInteger(raw, type);
  if (type === "bytes" || FIXED_BYTES.test(type)) {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!isHex(text)) return fail("Enter 0x followed by hex.");
    const size = FIXED_BYTES.exec(type)?.[1];
    if (size && text.length !== 2 + Number(size) * 2) return fail(`Enter exactly ${size} bytes.`);
    return { ok: true, value: text };
  }
  return fail(`${type} is not supported yet.`);
}

function parseValue(raw: unknown, type: string): Parsed {
  const array = ARRAY.exec(type);
  if (!array) return parseScalar(raw, type);
  let items: unknown = raw;
  if (typeof raw === "string") {
    try {
      items = JSON.parse(raw);
    } catch (error) {
      console.warn("Array argument is not JSON", error);
      return fail('Enter a JSON list, for example ["0x…", "0x…"].');
    }
  }
  if (!Array.isArray(items)) return fail("Enter a JSON list.");
  if (array[2] && items.length !== Number(array[2]))
    return fail(`Enter exactly ${array[2]} items.`);
  const values: ParsedValue[] = [];
  for (const item of items) {
    const parsed = parseValue(item, array[1]);
    if (!parsed.ok) return parsed;
    values.push(parsed.value);
  }
  return { ok: true, value: values };
}

export function parseArgs(inputs: readonly AbiInput[], values: Readonly<Record<string, string>>) {
  const args: ParsedValue[] = [];
  const errors: Record<string, string> = {};
  inputs.forEach((input, index) => {
    const key = input.name || String(index);
    const parsed = parseValue(values[key] ?? "", input.type);
    if (parsed.ok) args.push(parsed.value);
    else errors[key] = parsed.error;
  });
  return { args, errors, isValid: Object.keys(errors).length === 0 };
}

export function parseMonValue(text: string): { value: bigint } | { error: string } {
  const trimmed = text.trim();
  if (trimmed === "") return { value: 0n };
  if (!/^\d+(\.\d{1,18})?$/.test(trimmed)) return { error: "Enter an amount of MON, like 0.5." };
  return { value: parseEther(trimmed) };
}
