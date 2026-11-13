import type { ReactNode } from "react";
import { ResultsSheet } from "@/components/ui/results-sheet";
import { aiCopy } from "@/lib/copy";
import { monguardCopy } from "../copy";
import type { FixResult, ScanReport } from "../types";
import { FixDiff } from "./fix-diff";
import { FixPanel } from "./fix-panel";
import { ReportPanel } from "./report-panel";
import { SourceView } from "./source-view";

interface FixReview {
  view: "findings" | "fixes";
  fix: FixResult | undefined;
  isChosen: (id: string) => boolean;
  onToggleFix: (id: string) => void;
  onShowFindings: () => void;
}

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
  review?: FixReview;
  footer?: ReactNode;
}

export function ScanResults({ review, ...props }: ScanResultsProps) {
  const fix = review?.view === "fixes" ? review.fix : undefined;

  return (
    <ResultsSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={monguardCopy.resultsTitle}
      description={props.report.contractName}
      closeLabel={aiCopy.closeResults}
      footer={props.footer}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:sticky lg:top-0">
          {fix ? (
            <FixDiff
              fileName={props.fileName}
              source={props.source}
              fixedSource={fix.fixedSource}
            />
          ) : (
            <SourceView
              fileName={props.fileName}
              source={props.source}
              highlightedLines={props.highlightedLines}
              canEdit={props.canEdit}
            />
          )}
        </div>
        {fix && review ? (
          <FixPanel report={props.report} fix={fix} onBack={review.onShowFindings} />
        ) : (
          <ReportPanel
            report={props.report}
            isStale={props.isStale}
            activeId={props.activeId}
            onToggle={props.onToggle}
            choices={
              review ? { isChosen: review.isChosen, onToggle: review.onToggleFix } : undefined
            }
          />
        )}
      </div>
    </ResultsSheet>
  );
}
