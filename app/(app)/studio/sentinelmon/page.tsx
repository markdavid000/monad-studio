"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Plus,
  Trash2,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Bell,
  BellOff,
  ExternalLink,
  Loader2,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getExplorerTxUrl, getExplorerAddressUrl } from "@/lib/monad";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasUsed: number;
  status: "success" | "failed" | "unknown";
  blockNumber: number;
  timestamp: number;
  input: string;
  direction: "in" | "out";
}

interface Anomaly {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  type: "drain" | "spike" | "unusual_call" | "anomaly" | "info";
  title: string;
  message: string;
  relatedTxHash: string | null;
  detectedAt: number;
}

interface WatchedContract {
  address: string;
  label: string;
  addedAt: number;
  txCount: number;
  alertCount: number;
  lastBlock: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 3000; // 3 seconds
const ANALYZE_EVERY = 5; // Analyze after every N new transactions
const MAX_TXS_DISPLAY = 100;

const SEVERITY_CONFIG = {
  critical: {
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    label: "Critical",
  },
  high: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    label: "High",
  },
  medium: {
    color: "text-monad-400",
    bg: "bg-monad-400/10",
    border: "border-monad-400/30",
    label: "Medium",
  },
  low: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    label: "Low",
  },
  info: {
    color: "text-ink-muted",
    bg: "bg-surface-3",
    border: "border-border",
    label: "Info",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const secs = Math.floor((Date.now() - timestamp) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-3 transition-all group border border-transparent hover:border-border"
    >
      {/* Direction icon */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          tx.direction === "in" ? "bg-success/10" : "bg-monad-400/10"
        )}
      >
        {tx.direction === "in" ? (
          <ArrowDownLeft className="w-3.5 h-3.5 text-success" />
        ) : (
          <ArrowUpRight className="w-3.5 h-3.5 text-monad-400" />
        )}
      </div>

      {/* Tx info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={getExplorerTxUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-ink-muted hover:text-monad-400 transition-colors"
          >
            {shortAddr(tx.hash)}
          </a>
          {tx.input && tx.input !== "0x" && (
            <span className="text-xs font-mono text-ink-faint bg-surface-4 px-1.5 py-0.5 rounded">
              call
            </span>
          )}
        </div>
        <p className="text-xs text-ink-faint mt-0.5">
          {tx.direction === "in" ? "from" : "to"}{" "}
          <span className="font-mono">
            {shortAddr(tx.direction === "in" ? tx.from : tx.to || "")}
          </span>
        </p>
      </div>

      {/* Value */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-xs font-mono font-medium",
            tx.direction === "in" ? "text-success" : "text-monad-400"
          )}
        >
          {tx.direction === "in" ? "+" : "-"}
          {tx.value} MON
        </p>
        <p className="text-xs text-ink-faint">{timeAgo(tx.timestamp)}</p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        {tx.status === "success" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
        ) : tx.status === "failed" ? (
          <XCircle className="w-3.5 h-3.5 text-danger" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border border-border" />
        )}
      </div>
    </motion.div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const cfg = SEVERITY_CONFIG[anomaly.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-3 space-y-1", cfg.bg, cfg.border)}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0", cfg.color)} />
        <span className={cn("text-xs font-mono font-bold", cfg.color)}>
          {cfg.label}
        </span>
        <span className="text-xs font-mono text-ink-faint ml-auto">
          {timeAgo(anomaly.detectedAt)}
        </span>
      </div>
      <p className="text-sm font-medium text-ink">{anomaly.title}</p>
      <p className="text-xs text-ink-muted leading-relaxed">
        {anomaly.message}
      </p>
      {anomaly.relatedTxHash && (
        <a
          href={getExplorerTxUrl(anomaly.relatedTxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-mono text-monad-400 hover:text-monad-300 transition-colors pt-1"
        >
          <ExternalLink className="w-3 h-3" />
          View transaction
        </a>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SentinelMonPage() {
  const [contracts, setContracts] = useState<WatchedContract[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [addLabel, setAddLabel] = useState("");
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "polling" | "error">("idle");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBlockRef = useRef<number>(0);
  const txCountRef = useRef(0);
  const analyzeCountRef = useRef(0); // tracks txs since last analysis

  // Load contracts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sentinelmon_contracts");
      if (stored) {
        const parsed = JSON.parse(stored);
        setContracts(parsed);
        if (parsed.length > 0) setSelected(parsed[0].address);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save contracts to localStorage
  const saveContracts = (updated: WatchedContract[]) => {
    setContracts(updated);
    localStorage.setItem("sentinelmon_contracts", JSON.stringify(updated));
  };

  const addContract = () => {
    const addr = addInput.trim();
    if (!isValidAddress(addr)) {
      setAddError(
        "Invalid Ethereum address. Must be 0x followed by 40 hex characters."
      );
      return;
    }
    if (contracts.find((c) => c.address.toLowerCase() === addr.toLowerCase())) {
      setAddError("This contract is already being monitored.");
      return;
    }

    const newContract: WatchedContract = {
      address: addr,
      label: addLabel.trim() || `Contract ${contracts.length + 1}`,
      addedAt: Date.now(),
      txCount: 0,
      alertCount: 0,
      lastBlock: 0,
    };

    const updated = [...contracts, newContract];
    saveContracts(updated);
    setSelected(addr);
    setAddInput("");
    setAddLabel("");
    setAddError("");
    setShowAddForm(false);
    setIsAdding(false);
    toast.success(`Now watching ${newContract.label}`);
  };

  const removeContract = (address: string) => {
    const updated = contracts.filter((c) => c.address !== address);
    saveContracts(updated);
    if (selected === address) {
      setSelected(updated[0]?.address || null);
      setTransactions([]);
      setAnomalies([]);
    }
    toast.success("Contract removed from watch list");
  };

  // Fetch transactions — no contracts dependency to avoid polling restart bug
  // Single polling effect — self-contained with no external dependencies
  useEffect(() => {
    // Always clear any existing interval first
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (!isLive || !selected) {
      setStatus("idle");
      return;
    }

    const contractAddress = selected;

    const poll = async () => {
      setStatus("polling");
      try {
        const res = await fetch("/api/sentinelmon/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractAddress,
            fromBlock: lastBlockRef.current || 0,
          }),
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();
        if (data.latestBlock) lastBlockRef.current = data.latestBlock;

        if (data.transactions?.length > 0) {
          setTransactions((prev) => {
            const existing = new Set(prev.map((t) => t.hash));
            const newTxs = (data.transactions as Transaction[]).filter(
              (t) => !existing.has(t.hash)
            );
            if (newTxs.length === 0) return prev;

            txCountRef.current += newTxs.length;
            analyzeCountRef.current += newTxs.length;

            // Trigger AI analysis every ANALYZE_EVERY new transactions
            if (analyzeCountRef.current >= ANALYZE_EVERY) {
              analyzeCountRef.current = 0;
              const batch = [...newTxs, ...[]].slice(0, ANALYZE_EVERY);
              fetch("/api/sentinelmon/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions: batch, contractAddress }),
              })
                .then((r) => r.json())
                .then((result) => {
                  if (result.anomalies?.length > 0) {
                    const stamped: Anomaly[] = result.anomalies.map(
                      (a: Omit<Anomaly, "detectedAt">) => ({
                        ...a,
                        detectedAt: Date.now(),
                      })
                    );
                    setAnomalies((prev) => [...stamped, ...prev].slice(0, 50));
                    setContracts((prev) =>
                      prev.map((c) =>
                        c.address === contractAddress
                          ? { ...c, alertCount: c.alertCount + stamped.length }
                          : c
                      )
                    );
                    const critical = stamped.filter(
                      (a) => a.severity === "critical"
                    );
                    if (critical.length > 0) {
                      toast.error(`🚨 ${critical[0].title}`, {
                        duration: 8000,
                      });
                    }
                  }
                })
                .catch(() => {});
            }

            setContracts((prev) =>
              prev.map((c) =>
                c.address === contractAddress
                  ? { ...c, txCount: c.txCount + newTxs.length }
                  : c
              )
            );

            return [...newTxs, ...prev].slice(0, MAX_TXS_DISPLAY);
          });
        }

        setStatus("polling");
      } catch {
        setStatus("error");
      }
    };

    // Immediate first poll then interval
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);

    // Cleanup — this runs when isLive becomes false OR selected changes
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isLive, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when switching contracts
  useEffect(() => {
    setTransactions([]);
    setAnomalies([]);
    lastBlockRef.current = 0;
    setIsLive(false);
  }, [selected]);

  const selectedContract = contracts.find((c) => c.address === selected);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <Eye className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">
            SentinelMon
          </h1>
          <p className="text-sm text-ink-muted">
            Real-time contract monitoring on Monad
          </p>
        </div>

        {/* Live indicator */}
        {isLive && (
          <div className="ml-auto flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1.5">
            <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
            <span className="text-xs font-mono text-success">Live</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Left: Contract List ── */}
        <div className="col-span-12 lg:col-span-3">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="section-label">Watching</p>
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="w-6 h-6 rounded-md bg-surface-4 hover:bg-surface-5 flex items-center justify-center transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-ink-muted" />
              </button>
            </div>

            {/* Add form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <input
                    type="text"
                    value={addLabel}
                    onChange={(e) => setAddLabel(e.target.value)}
                    placeholder="Label (e.g. My Token)"
                    className="input-base w-full text-xs"
                  />
                  <input
                    type="text"
                    value={addInput}
                    onChange={(e) => {
                      setAddInput(e.target.value);
                      setAddError("");
                    }}
                    placeholder="0x contract address..."
                    className="input-base w-full text-xs font-mono"
                  />
                  {addError && (
                    <p className="text-xs text-danger">{addError}</p>
                  )}
                  <button
                    onClick={addContract}
                    disabled={isAdding}
                    className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3 h-3" />
                    Watch Contract
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contract list */}
            {contracts.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <Eye className="w-8 h-8 text-ink-faint" />
                <p className="text-xs text-ink-faint">
                  No contracts watched yet
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  + Add your first contract
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {contracts.map((contract) => (
                  <div
                    key={contract.address}
                    onClick={() => setSelected(contract.address)}
                    className={cn(
                      "group rounded-lg p-3 cursor-pointer transition-all border",
                      selected === contract.address
                        ? "bg-cyan-400/10 border-cyan-400/30"
                        : "hover:bg-surface-3 border-transparent hover:border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            selected === contract.address
                              ? "text-cyan-400"
                              : "text-ink"
                          )}
                        >
                          {contract.label}
                        </p>
                        <p className="text-xs font-mono text-ink-faint mt-0.5">
                          {shortAddr(contract.address)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeContract(contract.address);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-ink-faint font-mono">
                        {contract.txCount} txs
                      </span>
                      {contract.alertCount > 0 && (
                        <span className="text-xs font-mono text-danger bg-danger/10 px-1.5 py-0.5 rounded-full border border-danger/20">
                          {contract.alertCount} alerts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Live Feed ── */}
        <div className="col-span-12 lg:col-span-6">
          {!selected ? (
            <div className="card p-12 flex flex-col items-center text-center gap-4">
              <Eye className="w-12 h-12 text-ink-faint" />
              <div>
                <p className="font-display font-semibold text-ink mb-1">
                  No contract selected
                </p>
                <p className="text-sm text-ink-muted">
                  Add a contract address to start monitoring
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Control bar */}
              <div className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm">
                    {selectedContract?.label}
                  </p>
                  <a
                    href={getExplorerAddressUrl(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-mono text-ink-faint hover:text-monad-400 transition-colors"
                  >
                    {shortAddr(selected)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {status === "polling" && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-success">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Scanning
                    </div>
                  )}
                  {status === "error" && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-danger">
                      <div className="w-2 h-2 rounded-full bg-danger" />
                      RPC Error
                    </div>
                  )}
                  {status === "idle" && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-ink-faint">
                      <div className="w-2 h-2 rounded-full bg-ink-faint" />
                      Paused
                    </div>
                  )}
                </div>

                {/* Live toggle */}
                <button
                  onClick={() => setIsLive((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                    isLive
                      ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                      : "bg-surface-3 border-border text-ink-muted hover:text-ink hover:border-border-bright"
                  )}
                >
                  {isLive ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Go Live
                    </>
                  )}
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Transactions",
                    value: transactions.length,
                    icon: Activity,
                    color: "text-cyan-400",
                  },
                  {
                    label: "Alerts",
                    value: anomalies.length,
                    icon: AlertTriangle,
                    color: "text-danger",
                  },
                  {
                    label: "AI Analysis",
                    value: `every ${ANALYZE_EVERY} txs`,
                    icon: Loader2,
                    color: "text-monad-400",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="card p-3 flex items-center gap-3"
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", stat.color)} />
                      <div>
                        <p className="text-lg font-display font-bold text-ink">
                          {stat.value}
                        </p>
                        <p className="text-xs text-ink-faint">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transaction feed */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="section-label">Live Transaction Feed</p>
                  <p className="text-xs font-mono text-ink-faint">
                    {transactions.length > 0
                      ? `${transactions.length} transactions`
                      : "Waiting..."}
                  </p>
                </div>

                <div className="divide-y divide-border/50 max-h-[480px] overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      {isLive ? (
                        <>
                          <Loader2 className="w-8 h-8 text-ink-faint animate-spin" />
                          <p className="text-sm text-ink-muted">
                            Scanning Monad blocks...
                          </p>
                          <p className="text-xs text-ink-faint">
                            Checking last 50 blocks
                          </p>
                        </>
                      ) : (
                        <>
                          <Activity className="w-8 h-8 text-ink-faint" />
                          <p className="text-sm text-ink-muted">
                            No transactions yet
                          </p>
                          <p className="text-xs text-ink-faint">
                            Press Go Live to start monitoring
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {transactions.map((tx) => (
                        <TxRow key={tx.hash} tx={tx} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Alerts ── */}
        <div className="col-span-12 lg:col-span-3">
          <div className="card p-4 space-y-3 sticky top-8">
            <div className="flex items-center justify-between">
              <p className="section-label">AI Alerts</p>
              {anomalies.length > 0 && (
                <button
                  onClick={() => setAnomalies([])}
                  className="text-xs text-ink-faint hover:text-ink transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {anomalies.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-success/50" />
                <p className="text-xs text-ink-faint">No anomalies detected</p>
                <p className="text-xs text-ink-faint leading-relaxed">
                  AI analysis runs every {ANALYZE_EVERY} transactions
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {anomalies.map((anomaly) => (
                    <AnomalyCard
                      key={anomaly.id + anomaly.detectedAt}
                      anomaly={anomaly}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 bg-surface-3 rounded-lg p-3 mt-2">
              <Info className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" />
              <p className="text-xs text-ink-faint leading-relaxed">
                AI analyzes transaction patterns for drains, spikes, and unusual
                calls using Monad&apos;s 0.4s blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
