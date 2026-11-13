import { useState } from "react";
import { exampleContracts, type ExampleContract } from "@/config/examples";
import { demoReports } from "../demo/demo-reports";
import { useFindingFocus } from "./use-finding-focus";

export function useMonguardDemo() {
  const [example, setExample] = useState<ExampleContract | undefined>(exampleContracts[0]);
  const [isResultsOpen, setResultsOpen] = useState(false);
  const report = example ? demoReports[example.id] : undefined;
  const focus = useFindingFocus(report);

  return {
    example,
    report,
    isResultsOpen,
    setResultsOpen,
    activeId: focus.activeId,
    highlightedLines: focus.highlightedLines,
    toggle: focus.toggle,
    pick: (next: ExampleContract) => {
      setExample(next);
      setResultsOpen(false);
      focus.reset();
    },
    open: () => {
      focus.reset();
      setResultsOpen(true);
    },
  };
}
