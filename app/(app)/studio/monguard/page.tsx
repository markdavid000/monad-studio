"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Scan,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  RotateCcw,
  Hammer,
  Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge, severityOrder } from "@/components/ui/severity-badge";
import { ScoreRing } from "@/components/ui/score-ring";
import type { ScanResult, Vulnerability, Severity } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

const EXAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // BUG: Reentrancy vulnerability
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] -= amount;
    }

    // BUG: Missing access control
    function emergencyDrain() public {
        payable(owner).transfer(address(this).balance);
    }

    // BUG: tx.origin authentication
    function adminTransfer(address to, uint256 amount) public {
        require(tx.origin == owner, "Not authorized");
        balances[to] += amount;
    }
}`;

const severityCount = (vulns: Vulnerability[], severity: Severity) =>
  vulns.filter((v) => v.severity === severity).length;

function VulnerabilityCard({ vuln }: { vuln: Vulnerability }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyFix = async () => {
    await navigator.clipboard.writeText(vuln.suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const borderColor: Record<Severity, string> = {
    critical: "border-danger/30 hover:border-danger/50",
    high: "border-warning/30 hover:border-warning/50",
    medium: "border-monad-400/30 hover:border-monad-400/50",
    low: "border-success/30 hover:border-success/50",
    info: "border-border hover:border-border-bright",
  };

  const bgColor: Record<Severity, string> = {
    critical: "bg-danger/5",
    high: "bg-warning/5",
    medium: "bg-monad-400/5",
    low: "bg-success/5",
    info: "bg-surface-2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border transition-all duration-200",
        bgColor[vuln.severity],
        borderColor[vuln.severity]
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <SeverityBadge severity={vuln.severity} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm">{vuln.title}</p>
          {vuln.lineNumbers && vuln.lineNumbers.length > 0 && (
            <p className="text-xs font-mono text-ink-faint mt-0.5">
              Line{vuln.lineNumbers.length > 1 ? "s" : ""}{" "}
              {vuln.lineNumbers.join(", ")}
            </p>
          )}
        </div>
        <span className="text-xs font-mono text-ink-faint shrink-0">{vuln.id}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-ink-faint shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-faint shrink-0" />
        )}
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
              <div>
                <p className="section-label mb-1.5">Technical Detail</p>
                <p className="text-sm text-ink-muted leading-relaxed">{vuln.description}</p>
              </div>

              <div className="flex gap-3 bg-surface-3 rounded-lg p-3">
                <Info className="w-4 h-4 text-monad-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-mono text-monad-400 mb-1">Why this matters</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{vuln.explanation}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="section-label">Suggested Fix</p>
                  <button
                    onClick={copyFix}
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
                <pre className="bg-surface-1 border border-border rounded-lg p-3 text-xs font-mono text-ink leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {vuln.suggestedFix}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MonGuardPage() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scan = async () => {
    if (!code.trim()) {
      toast.error("Please paste a Solidity contract first");
      return;
    }
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/monguard/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      const scanResult: ScanResult = {
        id: `scan-${Date.now()}`,
        contractName: data.contractName,
        score: data.score,
        scannedAt: new Date().toISOString(),
        vulnerabilities: data.vulnerabilities.sort(
          (a: Vulnerability, b: Vulnerability) =>
            severityOrder(a.severity) - severityOrder(b.severity)
        ),
        summary: data.summary,
      };

      setResult(scanResult);
      toast.success(`Scan complete — ${scanResult.vulnerabilities.length} issue(s) found`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCode("");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-danger" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">MonGuard</h1>
          <p className="text-sm text-ink-muted">AI-powered smart contract security scanner</p>
        </div>
        {result && (
          <button
            onClick={reset}
            className="ml-auto btn-ghost flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Input */}
        <div className={cn("col-span-12", result ? "lg:col-span-5" : "lg:col-span-12")}>
          <motion.div layout className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="section-label">Solidity Contract</p>
              <button
                onClick={() => { setCode(EXAMPLE_CONTRACT); setResult(null); setError(null); }}
                className="text-xs font-mono text-monad-400 hover:text-monad-300 transition-colors flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                Load vulnerable example
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-area h-80 w-full"
              placeholder={`// Paste your Solidity contract here\npragma solidity ^0.8.0;\n\ncontract MyToken {\n    ...\n}`}
              spellCheck={false}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={scan}
                disabled={scanning || !code.trim()}
                className={cn(
                  "btn-primary flex items-center gap-2 flex-1 justify-center",
                  (scanning || !code.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Scan Contract
                  </>
                )}
              </button>
              {code && (
                <button onClick={() => setCode("")} className="btn-secondary text-sm px-3">
                  Clear
                </button>
              )}
            </div>

            {!result && (
              <div className="flex items-start gap-2 bg-surface-3 rounded-lg p-3">
                <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                <p className="text-xs text-ink-faint leading-relaxed">
                  Analyzes 15+ vulnerability classes including reentrancy, access control
                  failures, bad randomness, and more. No code is stored.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="col-span-12 lg:col-span-7 space-y-4"
            >
              {/* Score card */}
              <div className="card p-6">
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.score} size={110} />
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-lg text-ink mb-1">
                      {result.contractName}
                    </h2>
                    <p className="text-sm text-ink-muted leading-relaxed mb-4">
                      {result.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(["critical", "high", "medium", "low", "info"] as Severity[]).map((sev) => {
                        const count = severityCount(result.vulnerabilities, sev);
                        if (count === 0) return null;
                        return (
                          <div key={sev} className="flex items-center gap-1.5">
                            <SeverityBadge severity={sev} />
                            <span className="text-xs font-mono text-ink-muted">×{count}</span>
                          </div>
                        );
                      })}
                      {result.vulnerabilities.length === 0 && (
                        <span className="badge bg-success/10 text-success border-success/20">
                          No vulnerabilities found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cross-tool actions */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <p className="text-xs text-ink-faint flex-1">Continue with this contract:</p>
                  <Link
                    href="/studio/gaslens"
                    className="flex items-center gap-1.5 text-xs font-mono text-warning hover:text-warning/80 transition-colors"
                  >
                    <Fuel className="w-3 h-3" />
                    Optimize Gas
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/studio/monadforge"
                    className="flex items-center gap-1.5 text-xs font-mono text-monad-400 hover:text-monad-300 transition-colors"
                  >
                    <Hammer className="w-3 h-3" />
                    Open in Forge
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Vulnerabilities list */}
              {result.vulnerabilities.length > 0 ? (
                <div className="space-y-3">
                  <p className="section-label px-1">
                    {result.vulnerabilities.length} Issue
                    {result.vulnerabilities.length !== 1 ? "s" : ""} Found
                  </p>
                  {result.vulnerabilities.map((vuln) => (
                    <VulnerabilityCard key={vuln.id} vuln={vuln} />
                  ))}
                </div>
              ) : (
                <div className="card p-8 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink mb-1">Clean contract</p>
                    <p className="text-sm text-ink-muted">
                      No vulnerabilities detected. Your contract looks secure.
                    </p>
                  </div>
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
