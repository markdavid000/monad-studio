"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fuel,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeDiff, getDiffStats, type DiffLine } from "@/lib/diff";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImpactLevel = "critical" | "high" | "medium" | "low";

interface GasOptimization {
  id: string;
  impact: ImpactLevel;
  title: string;
  description: string;
  estimatedSavings: number;
  lineNumbers: number[];
  original: string;
  optimized: string;
}

interface GasAnalysisResult {
  contractName: string;
  originalGasEstimate: number;
  optimizedGasEstimate: number;
  totalSavings: number;
  savingsPercentage: number;
  summary: string;
  optimizedCode: string;
  optimizations: GasOptimization[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const IMPACT_CONFIG: Record<
  ImpactLevel,
  { label: string; className: string; color: string }
> = {
  critical: {
    label: "Critical",
    className: "badge-critical",
    color: "text-danger",
  },
  high: { label: "High", className: "badge-high", color: "text-warning" },
  medium: {
    label: "Medium",
    className: "badge-medium",
    color: "text-monad-400",
  },
  low: { label: "Low", className: "badge-low", color: "text-success" },
};

const impactOrder = (impact: ImpactLevel) =>
  ({ critical: 0, high: 1, medium: 2, low: 3 }[impact]);

const EXAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GasHeavy {
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    address[] public holders;
    string public name = "GasHeavy Token";
    address public owner;

    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }

    // Gas issue: public instead of external, memory instead of calldata
    function batchTransfer(address[] memory recipients, uint256[] memory amounts) public {
        for (uint256 i = 0; i < recipients.length; i++) {
            require(balances[msg.sender] >= amounts[i], "Insufficient balance");
            balances[msg.sender] = balances[msg.sender] - amounts[i];
            balances[recipients[i]] = balances[recipients[i]] + amounts[i];
        }
    }

    // Gas issue: storage reads in loop, no unchecked counter
    function distributeRewards(uint256 rewardPerHolder) public {
        uint256 totalReward = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            balances[holders[i]] = balances[holders[i]] + rewardPerHolder;
            totalReward = totalReward + rewardPerHolder;
        }
        totalSupply = totalSupply + totalReward;
    }

    // Gas issue: require with long string
    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only the owner of this contract can call the mint function");
        uint256 newSupply = 0;
        newSupply = totalSupply + amount;
        totalSupply = newSupply;
        balances[to] = balances[to] + amount;
        holders.push(to);
    }

    // Gas issue: bool storage, not external
    bool public paused = false;
    function setPaused(bool _paused) public {
        require(msg.sender == owner, "Not owner");
        paused = _paused;
    }
}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImpactBadge({ impact }: { impact: ImpactLevel }) {
  const { label, className } = IMPACT_CONFIG[impact];
  return <span className={cn("badge", className)}>{label}</span>;
}

function SavingsBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 30
      ? "bg-success"
      : percentage >= 15
      ? "bg-warning"
      : "bg-monad-400";
  return (
    <div className="w-full h-1.5 bg-surface-4 rounded-full overflow-hidden">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

function OptimizationCard({ opt }: { opt: GasOptimization }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { color } = IMPACT_CONFIG[opt.impact];

  const copyOptimized = async () => {
    await navigator.clipboard.writeText(opt.optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-surface-2 transition-all duration-200 hover:border-border-bright"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <ImpactBadge impact={opt.impact} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{opt.title}</p>
          {opt.lineNumbers.length > 0 && (
            <p className="text-xs font-mono text-ink-faint mt-0.5">
              Line{opt.lineNumbers.length > 1 ? "s" : ""}{" "}
              {opt.lineNumbers.join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn("text-xs font-mono font-bold", color)}>
            ~{opt.estimatedSavings.toLocaleString()} gas
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-ink-faint" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-faint" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
              <p className="text-sm text-ink-muted leading-relaxed">
                {opt.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="section-label mb-1.5 text-danger">Before</p>
                  <pre className="bg-danger/5 border border-danger/20 rounded-lg p-3 text-xs font-mono text-ink leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {opt.original}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="section-label text-success">After</p>
                    <button
                      onClick={copyOptimized}
                      className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="bg-success/5 border border-success/20 rounded-lg p-3 text-xs font-mono text-ink leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {opt.optimized}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Diff View ────────────────────────────────────────────────────────────────

function DiffView({ diff }: { diff: DiffLine[] }) {
  const stats = useMemo(() => getDiffStats(diff), [diff]);
  const [copied, setCopied] = useState(false);

  // Collapse unchanged blocks of more than 4 lines
  const CONTEXT_LINES = 3;
  const rendered: { line: DiffLine; collapsed: boolean; groupSize?: number }[] =
    [];
  let unchangedRun: DiffLine[] = [];

  const flushUnchanged = () => {
    if (unchangedRun.length === 0) return;
    if (unchangedRun.length <= CONTEXT_LINES * 2 + 1) {
      unchangedRun.forEach((l) => rendered.push({ line: l, collapsed: false }));
    } else {
      // show first CONTEXT_LINES
      unchangedRun
        .slice(0, CONTEXT_LINES)
        .forEach((l) => rendered.push({ line: l, collapsed: false }));
      // collapse middle
      const middle = unchangedRun.slice(CONTEXT_LINES, -CONTEXT_LINES);
      rendered.push({
        line: middle[0],
        collapsed: true,
        groupSize: middle.length,
      });
      // show last CONTEXT_LINES
      unchangedRun
        .slice(-CONTEXT_LINES)
        .forEach((l) => rendered.push({ line: l, collapsed: false }));
    }
    unchangedRun = [];
  };

  for (const line of diff) {
    if (line.type === "unchanged") {
      unchangedRun.push(line);
    } else {
      flushUnchanged();
      rendered.push({ line, collapsed: false });
    }
  }
  flushUnchanged();

  const optimizedCode = diff
    .filter((l) => l.type !== "removed")
    .map((l) => l.content)
    .join("\n");

  const copyOptimized = async () => {
    await navigator.clipboard.writeText(optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Optimized contract copied to clipboard");
  };

  return (
    <div className="card overflow-hidden">
      {/* Diff header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-3">
        <div className="flex items-center gap-4">
          <p className="section-label">Diff View</p>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-success/30 border border-success/50" />
              <span className="text-success">+{stats.added} added</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-danger/30 border border-danger/50" />
              <span className="text-danger">−{stats.removed} removed</span>
            </span>
            <span className="text-ink-faint">{stats.unchanged} unchanged</span>
          </div>
        </div>
        <button
          onClick={copyOptimized}
          className="flex items-center gap-1.5 btn-secondary text-xs px-3 py-1.5"
        >
          {copied ? (
            <Check className="w-3 h-3 text-success" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied!" : "Copy Optimized"}
        </button>
      </div>

      {/* Diff lines */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-surface-1 font-mono text-xs leading-6">
        <table className="w-full border-collapse">
          <tbody>
            {rendered.map((item, idx) => {
              if (item.collapsed) {
                return (
                  <tr key={`collapse-${idx}`} className="bg-surface-2">
                    <td className="w-10 px-2 text-right text-ink-faint border-r border-border select-none">
                      ···
                    </td>
                    <td className="w-10 px-2 text-right text-ink-faint border-r border-border select-none">
                      ···
                    </td>
                    <td className="px-4 text-ink-faint italic py-0.5">
                      ↕ {item.groupSize} unchanged lines
                    </td>
                  </tr>
                );
              }

              const { line } = item;
              const isAdded = line.type === "added";
              const isRemoved = line.type === "removed";

              return (
                <tr
                  key={idx}
                  className={cn(
                    "group",
                    isAdded && "bg-success/8",
                    isRemoved && "bg-danger/8"
                  )}
                >
                  {/* Original line number */}
                  <td
                    className={cn(
                      "w-10 px-2 text-right select-none border-r py-0.5",
                      isAdded
                        ? "border-success/20 text-success/40"
                        : "border-border text-ink-faint"
                    )}
                  >
                    {line.lineNumberOriginal ?? ""}
                  </td>
                  {/* Optimized line number */}
                  <td
                    className={cn(
                      "w-10 px-2 text-right select-none border-r py-0.5",
                      isRemoved
                        ? "border-danger/20 text-danger/40"
                        : "border-border text-ink-faint"
                    )}
                  >
                    {line.lineNumberOptimized ?? ""}
                  </td>
                  {/* Gutter symbol */}
                  <td
                    className={cn(
                      "w-5 text-center select-none py-0.5",
                      isAdded && "text-success font-bold",
                      isRemoved && "text-danger font-bold",
                      !isAdded && !isRemoved && "text-ink-faint"
                    )}
                  >
                    {isAdded ? "+" : isRemoved ? "−" : " "}
                  </td>
                  {/* Content */}
                  <td
                    className={cn(
                      "px-3 py-0.5 whitespace-pre",
                      isAdded && "text-success",
                      isRemoved &&
                        "text-danger/80 line-through decoration-danger/40",
                      !isAdded && !isRemoved && "text-ink"
                    )}
                  >
                    {line.content || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GasLensPage() {
  const [code, setCode] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<GasAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "diff">("diff");

  const diff = useMemo(() => {
    if (!result) return null;
    return computeDiff(code, result.optimizedCode);
  }, [result, code]);

  const analyze = async () => {
    if (!code.trim()) {
      toast.error("Please paste a Solidity contract first");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/gaslens/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const sorted = {
        ...data,
        optimizations: [...data.optimizations].sort(
          (a: GasOptimization, b: GasOptimization) =>
            impactOrder(a.impact) - impactOrder(b.impact)
        ),
      };

      setResult(sorted);
      setActiveTab("diff");
      toast.success(
        `Analysis complete — ${sorted.optimizations.length} optimization(s) found`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCode("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
          <Fuel className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">GasLens</h1>
          <p className="text-sm text-ink-muted">
            AI-powered gas optimization for Solidity contracts
          </p>
        </div>
        {result && (
          <button
            onClick={reset}
            className="ml-auto btn-ghost flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            New Analysis
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Input panel */}
        <div
          className={cn(
            "col-span-12",
            result ? "lg:col-span-4" : "lg:col-span-12"
          )}
        >
          <motion.div layout className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="section-label">Solidity Contract</p>
              <button
                onClick={() => {
                  setCode(EXAMPLE_CONTRACT);
                  setResult(null);
                  setError(null);
                }}
                className="text-xs font-mono text-warning hover:text-warning/80 transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Load gas-heavy example
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-area h-80 w-full"
              placeholder={`// Paste your Solidity contract here\npragma solidity ^0.8.0;\n\ncontract MyContract {\n    ...\n}`}
              spellCheck={false}
            />

            <div className="flex gap-3">
              <button
                onClick={analyze}
                disabled={analyzing || !code.trim()}
                className={cn(
                  "btn-primary disabled:hover:bg-warning/90 shadow-none flex items-center gap-2 flex-1 justify-center",
                  "bg-warning hover:bg-warning/90",
                  (analyzing || !code.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Fuel className="w-4 h-4" />
                    Analyze Gas
                  </>
                )}
              </button>
              {code && (
                <button
                  onClick={() => setCode("")}
                  className="btn-secondary text-sm px-3"
                >
                  Clear
                </button>
              )}
            </div>

            {!result && (
              <div className="flex items-start gap-2 bg-surface-3 rounded-lg p-3">
                <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                <p className="text-xs text-ink-faint leading-relaxed">
                  GasLens checks for storage optimization, loop inefficiencies,
                  calldata vs memory, custom errors, unchecked counters, and
                  more.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && diff && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="col-span-12 lg:col-span-8 space-y-4"
            >
              {/* Summary card */}
              <div className="card p-5">
                <div className="flex items-start gap-5">
                  {/* Savings metric */}
                  <div className="shrink-0 text-center">
                    <div className="text-3xl font-display font-bold text-warning">
                      {result.savingsPercentage}%
                    </div>
                    <div className="text-xs font-mono text-ink-faint mt-0.5">
                      gas saved
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-display font-bold text-ink">
                        {result.contractName}
                      </h2>
                      <span className="badge bg-warning/10 text-warning border-warning/20">
                        {result.optimizations.length} optimization
                        {result.optimizations.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed mb-3">
                      {result.summary}
                    </p>
                    <SavingsBar percentage={result.savingsPercentage} />
                  </div>
                </div>

                {/* Gas numbers */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-ink-faint font-mono mb-1">
                      Original Est.
                    </p>
                    <p className="font-mono font-bold text-ink">
                      {result.originalGasEstimate.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-success" />
                    <p className="text-xs font-mono text-success mt-1">
                      −{result.totalSavings.toLocaleString()} gas
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-faint font-mono mb-1">
                      Optimized Est.
                    </p>
                    <p className="font-mono font-bold text-success">
                      {result.optimizedGasEstimate.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Cross-tool */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <p className="text-xs text-ink-faint flex-1">
                    Continue with this contract:
                  </p>
                  <Link
                    href="/studio/monguard"
                    className="flex items-center gap-1.5 text-xs font-mono text-danger hover:text-danger/80 transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    Security Scan
                  </Link>
                  <Link
                    href="/studio/monadforge"
                    className="flex items-center gap-1.5 text-xs font-mono text-monad-400 hover:text-monad-300 transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    Open in Forge
                  </Link>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit">
                <button
                  onClick={() => setActiveTab("diff")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                    activeTab === "diff"
                      ? "bg-surface-4 text-ink"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  Diff View
                </button>
                <button
                  onClick={() => setActiveTab("findings")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                    activeTab === "findings"
                      ? "bg-surface-4 text-ink"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  Findings ({result.optimizations.length})
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "diff" && <DiffView diff={diff} />}

              {activeTab === "findings" && (
                <div className="space-y-3">
                  {result.optimizations.map((opt) => (
                    <OptimizationCard key={opt.id} opt={opt} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-12"
          >
            <div className="card p-4 border-danger/30 bg-danger/5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
