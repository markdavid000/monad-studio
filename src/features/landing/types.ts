export interface DiffLine {
  kind: "add" | "remove" | "same";
  text: string;
}

export interface MonguardMockData {
  file: string;
  tool: string;
  score: number;
  findings: readonly { severity: string; title: string; lines: string; detail: string }[];
  fix: readonly DiffLine[];
}

export interface GaslensMockData {
  file: string;
  tool: string;
  summary: string;
  saving: string;
  diff: readonly DiffLine[];
  findings: readonly { impact: string; title: string; saving: string }[];
}

export interface ForgeMockData {
  prompt: string;
  file: string;
  code: readonly string[];
  wallet: string;
  steps: readonly { label: string; state: "done" | "active" }[];
}

export interface SentinelMockData {
  contract: string;
  address: string;
  rows: readonly {
    method: string;
    from: string;
    ago: string;
    status: "ok" | "flagged" | "failed";
  }[];
  flagTitle: string;
  flagBody: string;
}

export interface ParadebugMockData {
  contract: string;
  blocks: readonly { number: string; calls: readonly string[] }[];
  functions: readonly { name: string; blocks: number; of: number }[];
}
