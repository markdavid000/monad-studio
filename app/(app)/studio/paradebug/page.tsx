"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Search,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  Loader2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getExplorerTxUrl } from "@/lib/monad";
import { toast } from "sonner";
import type {
  ParaDebugResult,
  TxAnalysis,
} from "@/app/api/paradebug/analyze/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(ts: number) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

// ─── Gantt Chart ──────────────────────────────────────────────────────────────

function GanttChart({ blocks }: { blocks: ParaDebugResult["blocks"] }) {
  const [hoveredTx, setHoveredTx] = useState<TxAnalysis | null>(null);

  const displayBlocks = useMemo(
    () => blocks.filter((b) => b.txCount > 0).slice(0, 20),
    [blocks]
  );

  if (displayBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-ink-faint text-sm">
        No transaction data to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-6 px-1 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <div className="w-3 h-3 rounded-sm bg-success" />
          Parallel execution
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <div className="w-3 h-3 rounded-sm bg-danger" />
          Sequential re-execution
        </div>
      </div>

      {/* Block rows */}
      <div className="space-y-1.5">
        {displayBlocks.map((block) => (
          <div
            key={block.blockNumber}
            className="flex items-center gap-3 group"
          >
            {/* Block number */}
            <div className="w-20 text-xs font-mono text-ink-faint text-right shrink-0">
              #{block.blockNumber}
            </div>

            {/* Gantt row */}
            <div className="flex-1 h-8 bg-surface-3 rounded-lg overflow-hidden relative border border-border">
              {block.transactions.map((tx) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  style={{
                    position: "absolute",
                    left: `${tx.startTime * 100}%`,
                    width: `${Math.max(tx.duration * 100, 2)}%`,
                    top: "4px",
                    bottom: "4px",
                    transformOrigin: "left",
                  }}
                  className={cn(
                    "rounded cursor-pointer transition-all hover:brightness-125 hover:z-10",
                    tx.executionType === "parallel"
                      ? "bg-success/70 hover:bg-success"
                      : "bg-danger/70 hover:bg-danger"
                  )}
                  onMouseEnter={() => setHoveredTx(tx)}
                  onMouseLeave={() => setHoveredTx(null)}
                />
              ))}

              {/* Empty state for single tx */}
              {block.transactions.length === 1 && (
                <div
                  className={cn(
                    "absolute inset-1 rounded opacity-60",
                    block.transactions[0].executionType === "parallel"
                      ? "bg-success"
                      : "bg-danger"
                  )}
                />
              )}
            </div>

            {/* Tx count */}
            <div className="w-12 text-xs font-mono text-ink-faint shrink-0">
              {block.txCount} tx{block.txCount !== 1 ? "s" : ""}
            </div>

            {/* Time */}
            <div className="w-16 text-xs text-ink-faint shrink-0 hidden lg:block">
              {timeAgo(block.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredTx && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "p-3 rounded-xl border text-xs space-y-1.5 mt-2",
              hoveredTx.executionType === "parallel"
                ? "bg-success/10 border-success/30"
                : "bg-danger/10 border-danger/30"
            )}
          >
            <div className="flex items-center gap-2">
              {hoveredTx.executionType === "parallel" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              )}
              <span
                className={cn(
                  "font-mono font-bold",
                  hoveredTx.executionType === "parallel"
                    ? "text-success"
                    : "text-danger"
                )}
              >
                {hoveredTx.executionType === "parallel"
                  ? "Parallel"
                  : "Sequential Re-execution"}
              </span>
            </div>
            <div className="font-mono text-ink-muted">
              Tx:{" "}
              <a
                href={getExplorerTxUrl(hoveredTx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-monad-400 hover:underline"
              >
                {shortHash(hoveredTx.hash)}
              </a>
            </div>
            <div className="font-mono text-ink-muted">
              From: {shortAddr(hoveredTx.from)}
            </div>
            {hoveredTx.functionSelector && (
              <div className="font-mono text-ink-muted">
                Function:{" "}
                <span className="text-ink">0x{hoveredTx.functionSelector}</span>
              </div>
            )}
            {hoveredTx.gasUsed > 0 && (
              <div className="font-mono text-ink-muted">
                Gas used:{" "}
                <span className="text-ink">
                  {hoveredTx.gasUsed.toLocaleString()}
                </span>
              </div>
            )}
            {hoveredTx.conflictReason && (
              <div className="text-danger mt-1">{hoveredTx.conflictReason}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Parallel Ratio Ring ──────────────────────────────────────────────────────

function ParallelRing({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100);
  const size = 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = ratio * circumference;
  const color = pct >= 80 ? "#00E5A0" : pct >= 50 ? "#FFB547" : "#FF4D6A";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1E1E30"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-display font-bold" style={{ color }}>
          {pct}%
        </span>
        <span className="text-xs font-mono text-ink-faint">parallel</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EXAMPLE_ADDRESSES = [
  { label: "Paste any deployed contract address", address: "" },
];

export default function ParaDebugPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ParaDebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "chart" | "transactions" | "suggestions"
  >("chart");

  const analyze = async () => {
    if (!contractAddress.trim()) {
      toast.error("Please enter a contract address");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress.trim())) {
      toast.error("Invalid contract address format");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/paradebug/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: contractAddress.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setActiveTab("chart");

      if (data.totalTxs === 0) {
        toast.info("No recent activity found for this contract");
      } else {
        toast.success(
          `Analyzed ${data.totalTxs} transactions across ${data.blocks.length} blocks`
        );
      }
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
    setContractAddress("");
  };

  // Flatten all transactions for the table view
  const allTransactions = useMemo(
    () => result?.blocks.flatMap((b) => b.transactions) ?? [],
    [result]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-success" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">ParaDebug</h1>
          <p className="text-sm text-ink-muted">
            Parallel execution visualizer — unique to Monad
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

      {/* Input */}
      <motion.div layout className="card p-5 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x... contract address on Monad Testnet"
              className="input-base w-full font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && analyze()}
            />
          </div>
          <button
            onClick={analyze}
            disabled={analyzing || !contractAddress.trim()}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all",
              "bg-success hover:bg-success/90 text-white",
              (analyzing || !contractAddress.trim()) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>

        {!result && (
          <div className="flex items-start gap-2 mt-3 bg-surface-3 rounded-lg p-3">
            <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
            <p className="text-xs text-ink-faint leading-relaxed">
              ParaDebug scans the last 100 blocks for transactions involving
              your contract, detects storage conflicts that force sequential
              re-execution, and visualizes your contract&apos;s parallel
              execution efficiency on a Gantt chart.
            </p>
          </div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="card p-4 border-danger/30 bg-danger/5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Transactions",
                  value: result.totalTxs,
                  color: "text-ink",
                  sub: `across ${result.blocks.length} blocks`,
                },
                {
                  label: "Parallel",
                  value: result.parallelCount,
                  color: "text-success",
                  sub: "ran simultaneously",
                },
                {
                  label: "Sequential",
                  value: result.sequentialCount,
                  color: "text-danger",
                  sub: "re-executed due to conflict",
                },
                {
                  label: "Blocks Scanned",
                  value: result.scannedBlocks,
                  color: "text-monad-400",
                  sub: "last N blocks",
                },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <p
                    className={cn(
                      "text-2xl font-display font-bold",
                      stat.color
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-ink mt-0.5">
                    {stat.label}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="grid grid-cols-12 gap-6">
              {/* Parallel ratio + summary */}
              <div className="col-span-12 lg:col-span-3">
                <div className="card p-5 space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <ParallelRing ratio={result.parallelRatio} />
                    <div className="text-center">
                      <p className="text-sm font-medium text-ink">
                        Parallel Efficiency
                      </p>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {result.parallelRatio >= 0.8
                          ? "Excellent — minimal conflicts"
                          : result.parallelRatio >= 0.5
                          ? "Moderate — some conflicts detected"
                          : "Poor — high conflict rate"}
                      </p>
                    </div>
                  </div>

                  <div className="glow-line" />

                  <div>
                    <p className="section-label mb-2">AI Summary</p>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart + tabs */}
              <div className="col-span-12 lg:col-span-9 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit">
                  {(["chart", "transactions", "suggestions"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                          activeTab === tab
                            ? "bg-surface-4 text-ink"
                            : "text-ink-muted hover:text-ink"
                        )}
                      >
                        {tab === "suggestions"
                          ? `AI Suggestions (${result.aiSuggestions.length})`
                          : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </div>

                {/* Gantt Chart */}
                {activeTab === "chart" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-display font-semibold text-ink">
                        Execution Timeline
                      </p>
                      <p className="text-xs font-mono text-ink-faint">
                        Hover bars for details
                      </p>
                    </div>
                    {result.totalTxs === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <GitBranch className="w-10 h-10 text-ink-faint" />
                        <p className="text-sm text-ink-muted">
                          No transactions found in the last{" "}
                          {result.scannedBlocks} blocks
                        </p>
                        <p className="text-xs text-ink-faint">
                          Try a more active contract address
                        </p>
                      </div>
                    ) : (
                      <GanttChart blocks={result.blocks} />
                    )}
                  </motion.div>
                )}

                {/* Transactions table */}
                {activeTab === "transactions" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-display font-semibold text-ink">
                        {allTransactions.length} Transactions
                      </p>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-surface-3 sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Type
                            </th>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Tx Hash
                            </th>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Block
                            </th>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Function
                            </th>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Gas Used
                            </th>
                            <th className="px-4 py-2.5 text-left font-mono text-ink-faint">
                              Conflict
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {allTransactions.map((tx) => (
                            <tr
                              key={tx.hash}
                              className={cn(
                                "hover:bg-surface-3 transition-colors",
                                tx.executionType === "sequential" &&
                                  "bg-danger/5"
                              )}
                            >
                              <td className="px-4 py-2.5">
                                <span
                                  className={cn(
                                    "flex items-center gap-1.5 font-mono font-bold",
                                    tx.executionType === "parallel"
                                      ? "text-success"
                                      : "text-danger"
                                  )}
                                >
                                  {tx.executionType === "parallel" ? (
                                    <>
                                      <Zap className="w-3 h-3" /> Parallel
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="w-3 h-3" />{" "}
                                      Sequential
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono">
                                <a
                                  href={getExplorerTxUrl(tx.hash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-monad-400 hover:text-monad-300 flex items-center gap-1"
                                >
                                  {shortHash(tx.hash)}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-ink-muted">
                                #{tx.blockNumber}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-ink-muted">
                                {tx.functionSelector
                                  ? `0x${tx.functionSelector}`
                                  : "ETH transfer"}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-ink-muted">
                                {tx.gasUsed > 0
                                  ? tx.gasUsed.toLocaleString()
                                  : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-ink-faint max-w-xs truncate">
                                {tx.conflictReason || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* AI Suggestions */}
                {activeTab === "suggestions" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-5 space-y-4"
                  >
                    <p className="font-display font-semibold text-ink">
                      AI Optimization Suggestions
                    </p>

                    {result.aiSuggestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                        <CheckCircle2 className="w-10 h-10 text-success/50" />
                        <p className="text-sm text-ink-muted">
                          {result.totalTxs === 0
                            ? "No data to analyze yet. Try a contract with recent activity."
                            : "No specific optimizations needed — your contract is well parallelized."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.aiSuggestions.map((suggestion, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-3 bg-surface-3 rounded-xl p-4 border border-border"
                          >
                            <div className="w-6 h-6 rounded-full bg-success/20 border border-success/30 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-success">
                                {i + 1}
                              </span>
                            </div>
                            <p className="text-sm text-ink-muted leading-relaxed">
                              {suggestion}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-2 bg-surface-2 border border-border rounded-lg p-3 mt-2">
                      <Info className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" />
                      <p className="text-xs text-ink-faint leading-relaxed">
                        Suggestions are based on detected function selector
                        conflicts within blocks. Reducing shared state access
                        (mappings per user instead of global counters) is the
                        most effective way to improve parallel execution on
                        Monad.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
