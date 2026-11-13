import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { gaslensCopy } from "../copy";
import type { useGasReportView } from "../hooks/use-gas-report-view";
import type { GasReport } from "../types";
import { CodePanel } from "./code-panel";
import { ResultPanel } from "./result-panel";

interface GasResultsProps {
  report: GasReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  source: string;
  isStale: boolean;
  canEdit: boolean;
  view: ReturnType<typeof useGasReportView>;
}

export function GasResults({ report, view, ...props }: GasResultsProps) {
  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={gaslensCopy.resultsTitle}
      description={report.contractName}
      closeLabel={aiCopy.closeResults}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          <CodePanel
            fileName={props.fileName}
            source={props.source}
            diff={view.diff}
            optimizedSource={report.optimizedSource}
            mode={view.mode}
            hasChanges={view.hasChanges}
            highlightedKeys={view.highlightedKeys}
            flaggedKeys={view.flaggedKeys}
            onModeChange={view.setMode}
            canEdit={props.canEdit}
          />
        </div>
        <ResultPanel
          report={report}
          isStale={props.isStale}
          activeId={view.activeId}
          onToggle={view.toggle}
        />
      </div>
    </ResultsSheet>
  );
}
