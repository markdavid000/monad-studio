"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Zap } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-monad-400/20 border border-monad-400/30 flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-monad-400" />
          </div>
          <p className="text-ink-muted font-mono text-sm">Loading MonadStudio...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
