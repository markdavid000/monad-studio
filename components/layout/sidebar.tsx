"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShieldAlert,
  Fuel,
  Hammer,
  Eye,
  GitBranch,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-ink-muted group-hover:text-ink",
    activeBg: "bg-surface-4",
    description: "Overview",
  },
];

const tools = [
  {
    id: "monguard",
    label: "MonGuard",
    href: "/studio/monguard",
    icon: ShieldAlert,
    color: "text-danger",
    activeBg: "bg-danger/10",
    activeBorder: "border-danger/30",
    description: "Security scanner",
    dot: "bg-danger",
  },
  {
    id: "gaslens",
    label: "GasLens",
    href: "/studio/gaslens",
    icon: Fuel,
    color: "text-warning",
    activeBg: "bg-warning/10",
    activeBorder: "border-warning/30",
    description: "Gas optimizer",
    dot: "bg-warning",
  },
  {
    id: "monadforge",
    label: "MonadForge",
    href: "/studio/monadforge",
    icon: Hammer,
    color: "text-monad-400",
    activeBg: "bg-monad-400/10",
    activeBorder: "border-monad-400/30",
    description: "AI code generator",
    dot: "bg-monad-400",
  },
  {
    id: "sentinelmon",
    label: "SentinelMon",
    href: "/studio/sentinelmon",
    icon: Eye,
    color: "text-cyan-400",
    activeBg: "bg-cyan-400/10",
    activeBorder: "border-cyan-400/30",
    description: "Live monitor",
    dot: "bg-cyan-400",
  },
  {
    id: "paradebug",
    label: "ParaDebug",
    href: "/studio/paradebug",
    icon: GitBranch,
    color: "text-success",
    activeBg: "bg-success/10",
    activeBorder: "border-success/30",
    description: "Parallel visualizer",
    dot: "bg-success",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = usePrivy();

  const email = user?.email?.address || user?.google?.email || "";
  const displayName = email ? email.split("@")[0] : "Developer";

  return (
    <aside className="w-64 h-screen flex flex-col bg-surface-1 border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-monad-400/20 border border-monad-400/30 flex items-center justify-center shadow-monad transition-all group-hover:shadow-monad-lg">
            <Zap className="w-4 h-4 text-monad-400" />
          </div>
          <div>
            <span className="font-display font-bold text-ink text-sm tracking-wide">
              Monad
            </span>
            <span className="font-display font-bold text-monad-400 text-sm tracking-wide">
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Network indicator */}
      <div className="px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-ink-muted">Monad Testnet</span>
          <ChevronRight className="w-3 h-3 text-ink-faint ml-auto" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {/* Dashboard */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-surface-4 text-ink"
                  : "text-ink-muted hover:bg-surface-3 hover:text-ink"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-ink" : item.color)} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Tools section */}
        <div className="pt-4 pb-2">
          <p className="section-label px-3 mb-2">Tools</p>
        </div>

        {tools.map((tool, i) => {
          const Icon = tool.icon;
          const isActive = pathname.startsWith(tool.href);
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
            >
              <Link
                href={tool.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border",
                  isActive
                    ? `${tool.activeBg} ${tool.activeBorder} ${tool.color}`
                    : "text-ink-muted hover:bg-surface-3 hover:text-ink border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? tool.color : "group-hover:" + tool.color
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium", isActive ? tool.color : "")}>{tool.label}</p>
                  <p className="text-xs text-ink-faint truncate">{tool.description}</p>
                </div>
                {isActive && (
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", tool.dot)} />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
            pathname === "/settings"
              ? "bg-surface-4 text-ink"
              : "text-ink-muted hover:bg-surface-3 hover:text-ink"
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="font-medium">Settings</span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-2 border border-border">
          <div className="w-7 h-7 rounded-full bg-monad-400/20 border border-monad-400/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-monad-400 uppercase">
              {displayName[0] || "D"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink truncate">{displayName}</p>
            <p className="text-xs text-ink-faint">Free plan</p>
          </div>
          <button
            onClick={logout}
            className="p-1 rounded hover:bg-surface-4 text-ink-faint hover:text-danger transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
