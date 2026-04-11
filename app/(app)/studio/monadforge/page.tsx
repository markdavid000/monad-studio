"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  Hammer,
  Sparkles,
  Wallet,
  Rocket,
  Copy,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  Fuel,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  getExplorerTxUrl,
  getExplorerAddressUrl,
  monadTestnet,
} from "@/lib/monad";
import { toast } from "sonner";
import Link from "next/link";

function safeErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
    return JSON.stringify(err);
  }
  return "Unknown error";
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface ConstructorArg {
  name: string;
  type: string;
  description: string;
  placeholder: string;
}

interface GeneratedContract {
  contractName: string;
  description: string;
  code: string;
  constructorArgs: ConstructorArg[];
  warnings: string[];
}

interface DeploymentResult {
  contractAddress: string;
  txHash: string;
  contractName: string;
  deployedAt: string;
  compilerVersion: string;
}

type DeployStep = "idle" | "compiling" | "deploying" | "done";

// ─── Example prompts ────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "An ERC20 token called 'Monad Gold' with symbol 'MGLD', max supply of 1 million, with a mint function only the owner can call",
  "A simple escrow contract where a buyer deposits ETH, and funds are released to the seller only when the buyer confirms delivery",
  "A basic on-chain voting contract where the owner can create proposals and any address can vote yes or no",
  "A time-locked piggy bank where anyone can deposit ETH but withdrawals are only allowed after a set date",
  "An NFT contract with a max supply of 10,000, a mint price of 0.01 ETH, with metadata URI per token",
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function StepIndicator({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const done = current > step;
  const active = current === step;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
          done && "bg-success border-success text-white",
          active && "bg-monad-400 border-monad-400 text-white",
          !done && !active && "border-border text-ink-faint"
        )}
      >
        {done ? <Check className="w-3 h-3" /> : step}
      </div>
      <span
        className={cn(
          "text-xs font-mono",
          active && "text-ink",
          done && "text-success",
          !done && !active && "text-ink-faint"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function WalletGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-monad-400/10 border border-monad-400/20 flex items-center justify-center">
        <Wallet className="w-7 h-7 text-monad-400" />
      </div>
      <div>
        <p className="font-display font-semibold text-ink mb-1">
          Connect your wallet to deploy
        </p>
        <p className="text-sm text-ink-muted max-w-xs">
          You need a wallet connected to Monad Testnet to deploy contracts. Make
          sure you have some MON for gas.
        </p>
      </div>
      <button
        onClick={onConnect}
        className="btn-primary flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
      <div className="flex items-start gap-2 bg-surface-3 rounded-lg p-3 text-left max-w-sm">
        <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
        <p className="text-xs text-ink-faint">
          Add Monad Testnet to MetaMask: RPC{" "}
          <span className="font-mono">testnet-rpc.monad.xyz</span>, Chain ID{" "}
          <span className="font-mono">10143</span>, Symbol{" "}
          <span className="font-mono">MON</span>
        </p>
      </div>
    </div>
  );
}

type VerifyStatus =
  | "idle"
  | "verifying"
  | "verified"
  | "already_verified"
  | "error";

function DeploySuccess({
  result,
  sourceCode,
  constructorArgs,
}: {
  result: DeploymentResult;
  sourceCode: string;
  constructorArgs?: string;
}) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");

  const copyAddress = async () => {
    await navigator.clipboard.writeText(result.contractAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const verify = async () => {
    setVerifyStatus("verifying");
    setVerifyMessage("");

    try {
      const res = await fetch("/api/monadforge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: result.contractAddress,
          sourceCode,
          contractName: result.contractName,
          txHash: result.txHash,
          compilerVersion: result.compilerVersion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerifyStatus("error");
        setVerifyMessage(safeErrorMessage(data.error) || "Verification failed");
        return;
      }

      const finalStatus =
        data.status === "already_verified" ? "already_verified" : "verified";
      setVerifyStatus(finalStatus);
      setVerifyMessage(safeErrorMessage(data.message) || "Contract verified.");
      setExplorerUrl(data.explorerUrl);
      toast.success(data.message);
    } catch (err) {
      setVerifyStatus("error");
      setVerifyMessage(safeErrorMessage(err));
    }
  };

  const isVerified =
    verifyStatus === "verified" || verifyStatus === "already_verified";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
        <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
        <div>
          <p className="font-display font-semibold text-success">
            {result.contractName} deployed!
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            {new Date(result.deployedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-4 space-y-1">
          <p className="section-label">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-monad-400 flex-1 truncate">
              {result.contractAddress}
            </code>
            <button
              onClick={copyAddress}
              className="text-ink-faint hover:text-ink transition-colors"
            >
              {copiedAddr ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={getExplorerAddressUrl(result.contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint hover:text-monad-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <p className="section-label">Transaction Hash</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-ink-muted flex-1 truncate">
              {result.txHash}
            </code>
            <a
              href={getExplorerTxUrl(result.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint hover:text-monad-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Verify section */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Contract Verification</p>
            {isVerified && (
              <span className="badge bg-success/10 text-success border-success/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {isVerified ? (
            <div className="space-y-2">
              <p className="text-xs text-success">{verifyMessage}</p>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono text-monad-400 hover:text-monad-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on Monad Explorer
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-ink-muted leading-relaxed">
                Verify your source code on MonadVision so anyone can read and
                audit your contract on-chain.
              </p>

              {verifyStatus === "error" && (
                <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-danger leading-relaxed">
                    {verifyMessage}
                  </p>
                </div>
              )}

              <button
                onClick={verify}
                disabled={verifyStatus === "verifying"}
                className={cn(
                  "w-full flex items-center gap-2 justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all border",
                  "bg-monad-400/10 hover:bg-monad-400/20 text-monad-400 border-monad-400/20 hover:border-monad-400/40",
                  verifyStatus === "verifying" &&
                    "opacity-60 cursor-not-allowed"
                )}
              >
                {verifyStatus === "verifying" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Verify on MonadVision
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center gap-3">
        <p className="text-xs text-ink-faint flex-1">Next steps:</p>
        <Link
          href="/studio/sentinelmon"
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-400/80 transition-colors"
        >
          <Eye className="w-3 h-3" />
          Monitor
        </Link>
        <Link
          href="/studio/monguard"
          className="flex items-center gap-1.5 text-xs font-mono text-danger hover:text-danger/80 transition-colors"
        >
          <ShieldAlert className="w-3 h-3" />
          Scan
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Standalone Verify Panel ─────────────────────────────────────────────────

function VerifyPanel() {
  const [contractAddress, setContractAddress] = useState("");
  const [contractName, setContractName] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [txHash, setTxHash] = useState("");
  const [compilerVersion, setCompilerVersion] = useState("");
  const [status, setStatus] = useState<
    "idle" | "verifying" | "verified" | "already_verified" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");

  const isValid =
    contractAddress.startsWith("0x") &&
    contractAddress.length === 42 &&
    contractName.trim().length > 0 &&
    sourceCode.trim().length > 0;

  const verify = async () => {
    if (!isValid) return;
    setStatus("verifying");
    setMessage("");

    try {
      const res = await fetch("/api/monadforge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: contractAddress.trim(),
          sourceCode: sourceCode.trim(),
          contractName: contractName.trim(),
          txHash: txHash.trim() || undefined,
          compilerVersion: compilerVersion.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Verification failed");
        return;
      }

      setStatus(
        data.status === "already_verified" ? "already_verified" : "verified"
      );
      setMessage(data.message);
      setExplorerUrl(data.explorerUrl);
      toast.success(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setExplorerUrl("");
  };

  const isVerified = status === "verified" || status === "already_verified";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-4"
    >
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-monad-400" />
          <p className="font-display font-semibold text-ink">
            Verify Existing Contract
          </p>
        </div>
        <p className="text-sm text-ink-muted leading-relaxed">
          Already deployed a contract? Paste the details below to verify it on
          MonadVision without redeploying.
        </p>

        {isVerified ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <p className="font-display font-semibold text-success">
                  {status === "already_verified"
                    ? "Already verified!"
                    : "Verified!"}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">{message}</p>
              </div>
            </div>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-mono text-monad-400 hover:text-monad-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on MonadVision
              </a>
            )}
            <button
              onClick={reset}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Verify Another
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Contract address */}
            <div>
              <label className="section-label block mb-1.5">
                Contract Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => {
                  setContractAddress(e.target.value);
                  reset();
                }}
                placeholder="0x..."
                className="input-base w-full font-mono text-sm"
              />
            </div>

            {/* Contract name */}
            <div>
              <label className="section-label block mb-1.5">
                Contract Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => {
                  setContractName(e.target.value);
                  reset();
                }}
                placeholder="e.g. MyToken"
                className="input-base w-full text-sm"
              />
              <p className="text-xs text-ink-faint mt-1">
                Must match the contract name in your source code exactly
              </p>
            </div>

            {/* Compiler version */}
            <div>
              <label className="section-label block mb-1.5">
                Compiler Version{" "}
                <span className="text-ink-faint">(optional)</span>
              </label>
              <input
                type="text"
                value={compilerVersion}
                onChange={(e) => setCompilerVersion(e.target.value)}
                placeholder="e.g. 0.8.34+commit.80d5c536"
                className="input-base w-full font-mono text-sm"
              />
              <p className="text-xs text-ink-faint mt-1">
                Leave blank to auto-detect. Must match the version used to
                deploy.
              </p>
            </div>

            {/* Source code */}
            <div>
              <label className="section-label block mb-1.5">
                Source Code <span className="text-danger">*</span>
              </label>
              <textarea
                value={sourceCode}
                onChange={(e) => {
                  setSourceCode(e.target.value);
                  reset();
                }}
                placeholder={
                  "// SPDX-License-Identifier: MIT pragma solidity ^0.8.20; contract MyToken { ... }"
                }
                className="code-area w-full h-64"
                spellCheck={false}
              />
              <p className="text-xs text-ink-faint mt-1">
                Must be the exact source code compiled with optimizer enabled,
                200 runs, solc 0.8.20
              </p>
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger leading-relaxed">{message}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={verify}
              disabled={!isValid || status === "verifying"}
              className={cn(
                "btn-primary w-full flex items-center gap-2 justify-center",
                (!isValid || status === "verifying") &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              {status === "verifying" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying on MonadVision...
                </>
              ) : (
                <>
                  <FileCode2 className="w-4 h-4" />
                  Verify Contract
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-surface-2 border border-border rounded-xl p-4">
        <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
        <div className="text-xs text-ink-faint space-y-1 leading-relaxed">
          <p>
            Verification uses Monad&apos;s Sourcify instance — the same service
            used by Hardhat and Foundry on Monad.
          </p>
          <p>
            Once verified, your contract&apos;s source code and ABI will be
            publicly readable on MonadVision.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MonadForgePage() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [activeTab, setActiveTab] = useState<"forge" | "verify">("forge");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContract | null>(null);
  const [editedCode, setEditedCode] = useState("");
  const [constructorValues, setConstructorValues] = useState<
    Record<string, string>
  >({});
  const [deployStep, setDeployStep] = useState<DeployStep>("idle");
  const [deployResult, setDeployResult] = useState<DeploymentResult | null>(
    null
  );
  const [deployError, setDeployError] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const injectedWallet = wallets.find((w) => w.walletClientType === "metamask");
  const activeWallet = injectedWallet || embeddedWallet || wallets[0];

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe your contract first");
      return;
    }
    setGenerating(true);
    setGenerated(null);
    setDeployResult(null);
    setDeployError(null);

    try {
      const res = await fetch("/api/monadforge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setGenerated(data);
      setEditedCode(data.code);
      setConstructorValues({});
      setDeployResult(null);
      setDeployStep("idle");
      setCurrentStep(2);
      toast.success(`${data.contractName} generated`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(editedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const deploy = useCallback(async () => {
    if (!generated || !editedCode) return;
    if (!activeWallet) {
      toast.error("No wallet connected");
      return;
    }

    setDeployStep("compiling");
    setDeployError(null);

    try {
      // Step 1: Compile via server API
      toast.loading("Compiling contract...", { id: "deploy" });
      const compileRes = await fetch("/api/monadforge/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editedCode,
          contractName: generated.contractName,
        }),
      });
      const compiled = await compileRes.json();
      if (!compileRes.ok)
        throw new Error(compiled.error || "Compilation failed");

      // Step 2: Deploy
      setDeployStep("deploying");
      toast.loading("Deploying to Monad Testnet...", { id: "deploy" });

      await activeWallet.switchChain(monadTestnet.id);
      const provider = await activeWallet.getEthereumProvider();

      // Encode constructor args
      const args = generated.constructorArgs.map((arg) => {
        const val = constructorValues[arg.name] || "";
        if (arg.type === "uint256" || arg.type.startsWith("uint"))
          return BigInt(val || "0");
        if (arg.type === "bool") return val === "true";
        return val;
      });

      const { Interface, AbiCoder } = await import("ethers");
      const iface = new Interface(compiled.abi);
      const abiCoder = AbiCoder.defaultAbiCoder();

      let deployData = compiled.bytecode;
      if (args.length > 0) {
        const constructorFragment = iface.fragments.find(
          (f) => f.type === "constructor"
        );
        if (constructorFragment) {
          const encodedArgs = abiCoder.encode(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructorFragment.inputs.map((i: any) => i.type),
            args
          );
          deployData = compiled.bytecode + encodedArgs.slice(2);
        }
      }

      const accounts: string[] = await provider.request({
        method: "eth_accounts",
      });
      const from = accounts[0];

      const txHash: string = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from, data: deployData, gas: "0x4C4B40" }], // 5M gas limit
      });

      // Wait for receipt
      toast.loading("Waiting for confirmation...", { id: "deploy" });
      let receipt = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });
        if (receipt) break;
      }

      if (!receipt)
        throw new Error("Transaction not confirmed after 30 seconds");
      if (receipt.status === "0x0")
        throw new Error("Transaction reverted on-chain");

      const contractAddress = receipt.contractAddress;
      if (!contractAddress) throw new Error("No contract address in receipt");

      toast.dismiss("deploy");

      const result: DeploymentResult = {
        contractAddress,
        txHash,
        contractName: generated.contractName,
        deployedAt: new Date().toISOString(),
        compilerVersion: compiled.compilerVersion || "0.8.34+commit.80d5c536",
      };

      setDeployResult(result);
      setDeployStep("done");
      setCurrentStep(3);
      toast.success("Contract deployed successfully!");
    } catch (err) {
      toast.dismiss("deploy");
      const msg = err instanceof Error ? err.message : "Deployment failed";
      setDeployError(msg);
      setDeployStep("idle");
      toast.error(msg);
    }
  }, [generated, editedCode, activeWallet, constructorValues]);

  const reset = () => {
    setGenerated(null);
    setEditedCode("");
    setConstructorValues({});
    setDeployResult(null);
    setDeployStep("idle");
    setDeployError(null);
    setCurrentStep(1);
    setPrompt("");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-xl bg-monad-400/10 border border-monad-400/20 flex items-center justify-center">
          <Hammer className="w-5 h-5 text-monad-400" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">
            MonadForge
          </h1>
          <p className="text-sm text-ink-muted">
            AI contract generator & Monad deployer
          </p>
        </div>
        {generated && activeTab === "forge" && (
          <button
            onClick={reset}
            className="ml-auto btn-ghost flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        )}
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab("forge")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "forge"
              ? "bg-surface-4 text-ink"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <Hammer className="w-4 h-4" />
          Forge
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "verify"
              ? "bg-surface-4 text-ink"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <FileCode2 className="w-4 h-4" />
          Verify Contract
        </button>
      </div>

      {/* Verify tab */}
      {activeTab === "verify" && <VerifyPanel />}

      {/* Forge tab */}
      {activeTab === "forge" && (
        <>
          {/* Step indicators */}
          <div className="flex items-center gap-6 mb-8">
            <StepIndicator step={1} current={currentStep} label="Describe" />
            <div className="flex-1 h-px bg-border" />
            <StepIndicator
              step={2}
              current={currentStep}
              label="Review & Edit"
            />
            <div className="flex-1 h-px bg-border" />
            <StepIndicator step={3} current={currentStep} label="Deploy" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* ── Panel 1: Prompt ── */}
            <div
              className={cn(
                "col-span-12",
                generated ? "lg:col-span-4" : "lg:col-span-12"
              )}
            >
              <motion.div layout className="card p-5 space-y-4">
                <p className="section-label">Describe your contract</p>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-base w-full h-36 resize-none text-sm leading-relaxed"
                  placeholder="e.g. An ERC20 token called Monad Gold with symbol MGLD, max supply 1 million, with a mint function only the owner can call..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      generate();
                  }}
                />

                <button
                  onClick={generate}
                  disabled={generating || !prompt.trim()}
                  className={cn(
                    "btn-primary w-full flex items-center gap-2 justify-center",
                    (generating || !prompt.trim()) &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Contract
                    </>
                  )}
                </button>

                {/* Example prompts */}
                <div>
                  <p className="section-label mb-2">Examples</p>
                  <div className="space-y-1.5">
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="w-full text-left text-xs text-ink-muted hover:text-ink bg-surface-3 hover:bg-surface-4 rounded-lg px-3 py-2 transition-all leading-relaxed border border-transparent hover:border-border"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Panel 2: Code Editor ── */}
            <AnimatePresence>
              {generated && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="col-span-12 lg:col-span-5 space-y-4"
                >
                  {/* Contract info */}
                  <div className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h2 className="font-display font-bold text-ink">
                          {generated.contractName}
                        </h2>
                        <p className="text-sm text-ink-muted mt-0.5 leading-relaxed">
                          {generated.description}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link
                          href="/studio/monguard"
                          onClick={() => {
                            sessionStorage.setItem(
                              "monguard_prefill",
                              editedCode
                            );
                          }}
                          className="flex items-center gap-1 text-xs font-mono text-danger hover:text-danger/80 transition-colors"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          Scan
                        </Link>
                        <Link
                          href="/studio/gaslens"
                          onClick={() => {
                            sessionStorage.setItem(
                              "gaslens_prefill",
                              editedCode
                            );
                          }}
                          className="flex items-center gap-1 text-xs font-mono text-warning hover:text-warning/80 transition-colors"
                        >
                          <Fuel className="w-3 h-3" />
                          Optimize
                        </Link>
                      </div>
                    </div>

                    {/* Warnings */}
                    {generated.warnings.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setShowWarnings(!showWarnings)}
                          className="flex items-center gap-2 text-xs text-warning hover:text-warning/80 transition-colors"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {generated.warnings.length} warning
                          {generated.warnings.length > 1 ? "s" : ""}
                          {showWarnings ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        <AnimatePresence>
                          {showWarnings && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 space-y-1"
                            >
                              {generated.warnings.map((w, i) => (
                                <p
                                  key={i}
                                  className="text-xs text-warning bg-warning/5 rounded px-2 py-1"
                                >
                                  {w}
                                </p>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Code editor */}
                  <div className="card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                        <span className="text-xs font-mono text-ink-faint ml-2">
                          {generated.contractName}.sol
                        </span>
                      </div>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors"
                      >
                        {copiedCode ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedCode ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <textarea
                      value={editedCode}
                      onChange={(e) => setEditedCode(e.target.value)}
                      className="w-full h-96 bg-surface-1 text-ink font-mono text-xs leading-6 p-4 resize-none focus:outline-none"
                      spellCheck={false}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Panel 3: Deploy ── */}
            <AnimatePresence>
              {generated && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="col-span-12 lg:col-span-3"
                >
                  <div className="card p-5 space-y-5 sticky top-8">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-monad-400" />
                      <p className="font-display font-semibold text-ink">
                        Deploy
                      </p>
                    </div>

                    {/* Network badge */}
                    <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-mono text-ink-muted">
                        Monad Testnet
                      </span>
                      <span className="text-xs font-mono text-ink-faint ml-auto">
                        10143
                      </span>
                    </div>

                    {deployResult ? (
                      <DeploySuccess
                        result={deployResult}
                        sourceCode={editedCode}
                      />
                    ) : !authenticated ? (
                      <WalletGate onConnect={login} />
                    ) : (
                      <div className="space-y-4">
                        {/* Wallet status */}
                        <div className="flex items-center gap-2 text-xs">
                          <Wallet className="w-3.5 h-3.5 text-success" />
                          <span className="font-mono text-ink-muted truncate">
                            {activeWallet
                              ? `${activeWallet.address.slice(
                                  0,
                                  6
                                )}...${activeWallet.address.slice(-4)}`
                              : "No wallet"}
                          </span>
                          <span className="ml-auto text-success font-mono">
                            Connected
                          </span>
                        </div>

                        {/* Constructor args */}
                        {generated.constructorArgs.length > 0 && (
                          <div className="space-y-3">
                            <p className="section-label">
                              Constructor Arguments
                            </p>
                            {generated.constructorArgs.map((arg) => (
                              <div key={arg.name}>
                                <label className="flex items-center gap-1.5 text-xs font-mono text-ink-muted mb-1">
                                  <span className="text-monad-400">
                                    {arg.type}
                                  </span>
                                  <span>{arg.name}</span>
                                </label>
                                <input
                                  type="text"
                                  value={constructorValues[arg.name] || ""}
                                  onChange={(e) =>
                                    setConstructorValues((prev) => ({
                                      ...prev,
                                      [arg.name]: e.target.value,
                                    }))
                                  }
                                  placeholder={arg.placeholder}
                                  className="input-base w-full text-xs"
                                  title={arg.description}
                                />
                                <p className="text-xs text-ink-faint mt-1">
                                  {arg.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Deploy error */}
                        {deployError && (
                          <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-lg p-3">
                            <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                            <p className="text-xs text-danger leading-relaxed">
                              {deployError}
                            </p>
                          </div>
                        )}

                        {/* Deploy button */}
                        <button
                          onClick={deploy}
                          disabled={
                            deployStep === "compiling" ||
                            deployStep === "deploying"
                          }
                          className={cn(
                            "w-full flex items-center gap-2 justify-center rounded-lg px-4 py-3 font-medium text-sm transition-all",
                            "bg-monad-400 hover:bg-monad-500 text-white shadow-monad",
                            (deployStep === "compiling" ||
                              deployStep === "deploying") &&
                              "opacity-70 cursor-not-allowed"
                          )}
                        >
                          {deployStep === "compiling" && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Compiling...
                            </>
                          )}
                          {deployStep === "deploying" && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deploying...
                            </>
                          )}
                          {(deployStep === "idle" || deployStep === "done") && (
                            <>
                              <Rocket className="w-4 h-4" />
                              Deploy to Monad
                            </>
                          )}
                        </button>

                        <div className="flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-ink-faint shrink-0 mt-0.5" />
                          <p className="text-xs text-ink-faint leading-relaxed">
                            Deployment requires MON for gas. Get free testnet
                            MON at{" "}
                            <a
                              href="https://faucet.monad.xyz"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-monad-400 hover:underline"
                            >
                              faucet.monad.xyz
                            </a>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
