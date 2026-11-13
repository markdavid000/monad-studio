import { useState } from "react";
import { exampleContracts, type ExampleContract } from "@/config/examples";
import { demoReports } from "../demo/demo-reports";
import { useGasReportView } from "./use-gas-report-view";

export function useGaslensDemo() {
  const [example, setExample] = useState<ExampleContract | undefined>(exampleContracts[0]);
  const [isResultsOpen, setResultsOpen] = useState(false);
  const report = example ? demoReports[example.id] : undefined;
  const view = useGasReportView(report, example?.source ?? "");

  return {
    example,
    report,
    view,
    isResultsOpen,
    setResultsOpen,
    pick: (next: ExampleContract) => {
      setExample(next);
      setResultsOpen(false);
      view.reset();
    },
    open: () => {
      view.reset();
      setResultsOpen(true);
    },
  };
}
