const PRAGMA = /pragma\s+solidity\s+([^;]+);/;
const DECLARATION = /^\s*(?:abstract\s+)?(contract|interface|library)\s+([A-Za-z_$][\w$]*)/gm;

export interface ContractOutline {
  pragma: string | undefined;
  declarations: { kind: "contract" | "interface" | "library"; name: string }[];
}

function isKind(value: string): value is "contract" | "interface" | "library" {
  return value === "contract" || value === "interface" || value === "library";
}

export function outlineOf(source: string): ContractOutline {
  const declarations = [...source.matchAll(DECLARATION)].flatMap(([, kind, name]) =>
    kind && name && isKind(kind) ? [{ kind, name }] : []
  );
  return { pragma: PRAGMA.exec(source)?.[1]?.trim(), declarations };
}
