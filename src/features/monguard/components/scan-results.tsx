import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { monguardCopy } from "../copy";
import type { ScanReport } from "../types";
import { ReportPanel } from "./report-panel";
import { SourceView } from "./source-view";

interface ScanResultsProps {
  report: ScanReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  source: string;
  highlightedLines: readonly number[];
  isStale: boolean;
  canEdit: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
}

export function ScanResults(props: ScanResultsProps) {
  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={monguardCopy.resultsTitle}
      description={props.report.contractName}
      closeLabel={aiCopy.closeResults}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          <SourceView
            fileName={props.fileName}
            source={props.source}
            highlightedLines={props.highlightedLines}
            canEdit={props.canEdit}
          />
        </div>
        <ReportPanel
          report={props.report}
          isStale={props.isStale}
          activeId={props.activeId}
          onToggle={props.onToggle}
        />
      </div>
    </ResultsSheet>
  );
}
