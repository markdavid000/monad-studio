import type { CSSProperties } from "react";

export function step(index: number): CSSProperties {
  return { "--step": index } as CSSProperties;
}

export function scoreVar(score: number): CSSProperties {
  return { "--score": score } as CSSProperties;
}
