"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { aiCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import { useGaslens } from "../hooks/use-gaslens";
import { CodePanel } from "./code-panel";
import { ResultPanel } from "./result-panel";

export function GaslensTool() {
  const gaslens = useGaslens();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-[-0.02em]">{gaslensCopy.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{gaslensCopy.lead}</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info aria-hidden className="size-4 shrink-0" />
          {aiCopy.note}
        </p>
      </div>
      {gaslens.isEmpty ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-medium">{gaslensCopy.emptyTitle}</h2>
            <p className="text-muted-foreground">{gaslensCopy.emptyBody}</p>
          </div>
          <Button asChild>
            <Link href="/studio">{gaslensCopy.openWorkspace}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
          <CodePanel
            fileName={gaslens.fileName}
            source={gaslens.source}
            diff={gaslens.diff}
            optimizedSource={gaslens.report?.optimizedSource}
            mode={gaslens.mode}
            hasChanges={gaslens.hasChanges}
            highlightedKeys={gaslens.highlightedKeys}
            flaggedKeys={gaslens.flaggedKeys}
            onModeChange={gaslens.setMode}
          />
          <ResultPanel
            status={gaslens.status}
            report={gaslens.report}
            error={gaslens.error}
            isTooLarge={gaslens.isTooLarge}
            isStale={gaslens.isStale}
            activeId={gaslens.activeId}
            onToggle={gaslens.toggle}
            onRun={gaslens.run}
          />
        </div>
      )}
    </div>
  );
}
