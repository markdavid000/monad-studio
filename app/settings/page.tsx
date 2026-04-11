"use client";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { Settings, User, Bell, Key, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "wallet", label: "Connected Wallet", icon: Wallet },
];

export default function SettingsPage() {
  const { user } = usePrivy();
  const email = user?.email?.address || user?.google?.email || "";
  const displayName = email ? email.split("@")[0] : "Developer";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border flex items-center justify-center">
          <Settings className="w-5 h-5 text-ink-muted" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">Settings</h1>
          <p className="text-sm text-ink-muted">Manage your account and preferences</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar nav */}
        <div className="col-span-3">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all",
                    section.id === "profile"
                      ? "bg-surface-3 text-ink"
                      : "text-ink-muted hover:bg-surface-3 hover:text-ink"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-9 space-y-4">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="font-display font-semibold text-ink mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-monad-400/20 border-2 border-monad-400/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-monad-400 uppercase">
                    {displayName[0] || "D"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-ink">{displayName}</p>
                  <p className="text-sm text-ink-muted">{email || "No email connected"}</p>
                </div>
              </div>

              <div className="glow-line" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1.5">Display Name</label>
                  <input
                    type="text"
                    defaultValue={displayName}
                    className="input-base w-full"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={email}
                    className="input-base w-full"
                    placeholder="your@email.com"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary text-sm">Save Changes</button>
              </div>
            </div>
          </motion.div>

          {/* Plan */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-ink">Current Plan</h2>
              <span className="badge bg-success/10 text-success border-success/20">Free</span>
            </div>
            <div className="space-y-2 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Unlimited MonGuard scans
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Unlimited GasLens analyses
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                5 MonadForge deployments / month
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                3 SentinelMon watches
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-ink-faint">
                Pro plan coming soon — unlimited everything + API access + priority support.
              </p>
            </div>
          </motion.div>

          {/* API Keys — coming soon */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-semibold text-ink">API Keys</h2>
              <span className="badge bg-surface-4 text-ink-faint border-border">Coming Soon</span>
            </div>
            <p className="text-sm text-ink-muted">
              Integrate MonadStudio into your own workflow via API. Available in the Pro plan.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
