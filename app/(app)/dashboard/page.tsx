"use client";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldAlert,
  Fuel,
  Hammer,
  Eye,
  GitBranch,
  ArrowRight,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "monguard",
    label: "MonGuard",
    description: "Scan smart contracts for vulnerabilities before deployment. Get an AI-powered security score and plain-English fixes.",
    href: "/studio/monguard",
    icon: ShieldAlert,
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
    hoverBorder: "hover:border-danger/40",
    glow: "hover:shadow-[0_0_24px_rgba(255,77,106,0.15)]",
    tag: "Security",
    tagColor: "bg-danger/10 text-danger border-danger/20",
    status: "Ready",
  },
  {
    id: "gaslens",
    label: "GasLens",
    description: "Analyze gas usage line-by-line and get an optimized version of your contract with estimated savings.",
    href: "/studio/gaslens",
    icon: Fuel,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    hoverBorder: "hover:border-warning/40",
    glow: "hover:shadow-[0_0_24px_rgba(255,181,71,0.15)]",
    tag: "Optimization",
    tagColor: "bg-warning/10 text-warning border-warning/20",
    status: "Ready",
  },
  {
    id: "monadforge",
    label: "MonadForge",
    description: "Generate Solidity contracts from natural language. Edit, scan, optimize, then deploy to Monad in one click.",
    href: "/studio/monadforge",
    icon: Hammer,
    color: "text-monad-400",
    bg: "bg-monad-400/10",
    border: "border-monad-400/20",
    hoverBorder: "hover:border-monad-400/40",
    glow: "hover:shadow-[0_0_24px_rgba(131,110,249,0.15)]",
    tag: "AI Forge",
    tagColor: "bg-monad-400/10 text-monad-400 border-monad-400/20",
    status: "Ready",
  },
  {
    id: "sentinelmon",
    label: "SentinelMon",
    description: "Monitor deployed contracts in real-time. Get instant alerts for anomalies, drains, or unusual activity.",
    href: "/studio/sentinelmon",
    icon: Eye,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    hoverBorder: "hover:border-cyan-400/40",
    glow: "hover:shadow-[0_0_24px_rgba(0,212,255,0.15)]",
    tag: "Monitoring",
    tagColor: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    status: "Ready",
  },
  {
    id: "paradebug",
    label: "ParaDebug",
    description: "Visualize parallel vs sequential transaction execution on Monad. Identify conflicts and maximize throughput.",
    href: "/studio/paradebug",
    icon: GitBranch,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    hoverBorder: "hover:border-success/40",
    glow: "hover:shadow-[0_0_24px_rgba(0,229,160,0.15)]",
    tag: "Debugging",
    tagColor: "bg-success/10 text-success border-success/20",
    status: "Ready",
  },
];

const stats = [
  { label: "Contracts Scanned", value: "0", icon: ShieldAlert, color: "text-danger" },
  { label: "Gas Optimizations", value: "0", icon: Fuel, color: "text-warning" },
  { label: "Deployments", value: "0", icon: Hammer, color: "text-monad-400" },
  { label: "Active Monitors", value: "0", icon: Eye, color: "text-cyan-400" },
];

export default function DashboardPage() {
  const { user } = usePrivy();
  const email = user?.email?.address || user?.google?.email || "";
  const displayName = email ? email.split("@")[0] : "Developer";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-ink-faint">Monad Testnet — Connected</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">
          Welcome back,{" "}
          <span className="text-gradient">{displayName}</span>
        </h1>
        <p className="text-ink-muted mt-1">
          Your complete developer environment for building on Monad.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-10"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-ink">{stat.value}</p>
                <p className="text-xs text-ink-muted">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Tools grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink">Studio Tools</h2>
          <p className="text-xs font-mono text-ink-faint">5 tools available</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.2 }}
              >
                <Link
                  href={tool.href}
                  className={cn(
                    "group card-hover flex items-center gap-6 p-5 border transition-all duration-300",
                    tool.border,
                    tool.hoverBorder,
                    tool.glow
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                      tool.bg,
                      tool.border
                    )}
                  >
                    <Icon className={cn("w-6 h-6", tool.color)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn("font-display font-semibold", tool.color)}>
                        {tool.label}
                      </h3>
                      <span
                        className={cn(
                          "text-xs font-mono px-2 py-0.5 rounded-full border",
                          tool.tagColor
                        )}
                      >
                        {tool.tag}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed">{tool.description}</p>
                  </div>

                  {/* Status + CTA */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-xs text-ink-faint font-mono">{tool.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-ink-muted group-hover:text-ink transition-colors">
                      <span className="text-sm">Open</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-ink-muted" />
          <h3 className="font-display font-semibold text-ink">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center">
            <Clock className="w-5 h-5 text-ink-faint" />
          </div>
          <p className="text-sm text-ink-muted">No activity yet</p>
          <p className="text-xs text-ink-faint">
            Your scans, deployments, and analyses will appear here
          </p>
          <Link
            href="/studio/monguard"
            className="btn-primary flex items-center gap-2 mt-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            Start with MonGuard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
