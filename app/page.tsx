"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldAlert,
  Fuel,
  Hammer,
  Eye,
  GitBranch,
  ArrowRight,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    icon: ShieldAlert,
    label: "MonGuard",
    description:
      "AI-powered security scanner. Catch vulnerabilities before they cost you millions.",
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
  },
  {
    icon: Fuel,
    label: "GasLens",
    description:
      "Line-by-line gas analysis and auto-optimization. Ship leaner contracts.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Hammer,
    label: "MonadForge",
    description:
      "Generate Solidity from plain English. Deploy to Monad in one click.",
    color: "text-monad-400",
    bg: "bg-monad-400/10",
    border: "border-monad-400/20",
  },
  {
    icon: Eye,
    label: "SentinelMon",
    description:
      "Real-time contract monitoring. Instant alerts at Monad's 0.4s block speed.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: GitBranch,
    label: "ParaDebug",
    description:
      "Visualize parallel execution conflicts. Maximize Monad's throughput.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
];

export default function LandingPage() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  const handleLaunch = () => {
    if (authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      {/* Background grid + glow */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-monad-glow pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-monad-400/20 border border-monad-400/30 flex items-center justify-center shadow-monad">
            <Zap className="w-4 h-4 text-monad-400" />
          </div>
          <span className="font-display font-bold text-ink">
            Monad<span className="text-monad-400">Studio</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="#tools"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Tools
          </Link>
          <Link
            href="/docs"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Pricing
          </Link>
          <button
            onClick={handleLaunch}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            Launch App
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-monad-400/10 border border-monad-400/20 rounded-full px-4 py-1.5 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-monad-400 animate-pulse" />
          <span className="text-xs font-mono text-monad-400">
            Built for Monad — EVM-compatible
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl md:text-6xl font-bold text-ink leading-tight max-w-3xl mb-6"
        >
          The complete developer environment for{" "}
          <span className="text-gradient">Monad</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-ink-muted max-w-xl leading-relaxed mb-10"
        >
          Write, secure, optimize, deploy, and monitor smart contracts — all in
          one studio. From first line of code to production monitoring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={handleLaunch}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
          >
            <Zap className="w-4 h-4" />
            Get Started Free
          </button>
          <Link
            href="/docs"
            className="btn-secondary flex items-center gap-2 px-6 py-3 text-base"
          >
            View Docs
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-ink-faint mt-4 font-mono"
        >
          No wallet required to get started · Account abstraction powered by
          Privy
        </motion.p>
      </section>

      {/* Divider */}
      <div className="relative z-10 px-8">
        <div className="glow-line" />
      </div>

      {/* Tools section */}
      <section
        id="tools"
        className="relative z-10 px-8 py-20 max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <p className="section-label mb-3">Five tools, one studio</p>
          <h2 className="font-display text-3xl font-bold text-ink">
            Everything you need to build on Monad
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "card-hover p-6 border group cursor-pointer",
                  tool.border
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 border",
                    tool.bg,
                    tool.border
                  )}
                >
                  <Icon className={cn("w-5 h-5", tool.color)} />
                </div>
                <h3
                  className={cn("font-display font-semibold mb-2", tool.color)}
                >
                  {tool.label}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {tool.description}
                </p>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="card p-6 min-h-[200px] flex flex-col items-center justify-center text-center border border-monad-400/20 bg-monad-400/5"
          >
            <div className="w-10 h-10 rounded-xl bg-monad-400/20 border border-monad-400/30 flex items-center justify-center mb-4 shadow-monad">
              <Zap className="w-5 h-5 text-monad-400" />
            </div>
            <p className="text-sm text-ink-muted mb-4">
              Ready to start building?
            </p>
            <button
              onClick={handleLaunch}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              Open MonadStudio
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-monad-400" />
          <span className="text-sm font-display font-bold text-ink-muted">
            Monad<span className="text-monad-400">Studio</span>
          </span>
        </div>
        <p className="text-xs text-ink-faint font-mono">
          Built on Monad · EVM-compatible · Open source coming soon
        </p>
      </footer>
    </div>
  );
}
