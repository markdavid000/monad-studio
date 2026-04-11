// Tool IDs
export type ToolId = "monguard" | "gaslens" | "monadforge" | "sentinelmon" | "paradebug";

// Severity levels for MonGuard
export type Severity = "critical" | "high" | "medium" | "low" | "info";

// Vulnerability finding from MonGuard
export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  explanation: string;
  suggestedFix: string;
  lineNumbers?: number[];
}

// MonGuard scan result
export interface ScanResult {
  id: string;
  contractName: string;
  score: number; // 0–100
  scannedAt: string;
  vulnerabilities: Vulnerability[];
  summary: string;
}

// GasLens optimization result
export interface GasOptimization {
  id: string;
  functionName: string;
  issue: string;
  explanation: string;
  estimatedSavings: number; // gas units
  lineNumbers?: number[];
}

export interface GasAnalysisResult {
  id: string;
  originalCode: string;
  optimizedCode: string;
  optimizations: GasOptimization[];
  totalEstimatedSavings: number;
  analyzedAt: string;
}

// MonadForge deployment
export interface Deployment {
  id: string;
  contractName: string;
  address: string;
  txHash: string;
  network: "testnet" | "mainnet";
  deployedAt: string;
  sourceCode: string;
}

// SentinelMon watched contract
export interface WatchedContract {
  id: string;
  address: string;
  label: string;
  network: "testnet" | "mainnet";
  addedAt: string;
  alertsCount: number;
  status: "healthy" | "warning" | "critical";
}

// SentinelMon alert
export interface Alert {
  id: string;
  contractAddress: string;
  type: "anomaly" | "drain" | "unusual_call" | "gas_spike";
  severity: Severity;
  message: string;
  txHash?: string;
  detectedAt: string;
  resolved: boolean;
}

// ParaDebug transaction analysis
export interface TransactionAnalysis {
  txHash: string;
  executionType: "parallel" | "sequential";
  conflictReason?: string;
  gasUsed: number;
  blockNumber: number;
}

export interface ParaDebugResult {
  id: string;
  contractAddress: string;
  blockRange: { from: number; to: number };
  transactions: TransactionAnalysis[];
  parallelRatio: number; // 0–1
  analyzedAt: string;
  aiSuggestions: string[];
}

// Nav item
export interface NavItem {
  id: ToolId | "dashboard" | "settings";
  label: string;
  href: string;
  icon: string;
  color: string;
  description: string;
  badge?: string;
}
