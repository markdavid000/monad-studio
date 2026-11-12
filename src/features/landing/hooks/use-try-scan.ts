import { useReducer } from "react";

type Phase = "idle" | "scanning" | "done";

interface TryScanState {
  sample: number;
  phase: Phase;
  runs: number;
}

type TryScanAction = { type: "select"; sample: number } | { type: "run" } | { type: "finish" };

function reducer(state: TryScanState, action: TryScanAction): TryScanState {
  switch (action.type) {
    case "select":
      return { ...state, sample: action.sample, phase: "idle" };
    case "run":
      return { ...state, phase: "scanning", runs: state.runs + 1 };
    case "finish":
      return state.phase === "scanning" ? { ...state, phase: "done" } : state;
  }
}

export function useTryScan() {
  const [state, dispatch] = useReducer(reducer, { sample: 0, phase: "idle", runs: 0 });

  function run() {
    dispatch({ type: "run" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatch({ type: "finish" });
    }
  }

  return {
    ...state,
    select: (sample: number) => dispatch({ type: "select", sample }),
    run,
    finish: () => dispatch({ type: "finish" }),
  };
}
