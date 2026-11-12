import { useReducer } from "react";

interface ShowcaseState {
  active: number;
  isPaused: boolean;
  changes: number;
}

type ShowcaseAction =
  { type: "select"; index: number } | { type: "advance" } | { type: "togglePause" };

function reducer(count: number) {
  return function showcaseReducer(state: ShowcaseState, action: ShowcaseAction): ShowcaseState {
    switch (action.type) {
      case "select":
        return { ...state, active: (action.index + count) % count, changes: state.changes + 1 };
      case "advance":
        return { ...state, active: (state.active + 1) % count, changes: state.changes + 1 };
      case "togglePause":
        return { ...state, isPaused: !state.isPaused };
    }
  };
}

export function useShowcase(count: number) {
  const [state, dispatch] = useReducer(reducer(count), { active: 0, isPaused: false, changes: 0 });

  return {
    active: state.active,
    isPaused: state.isPaused,
    changes: state.changes,
    select: (index: number) => dispatch({ type: "select", index }),
    advance: () => dispatch({ type: "advance" }),
    togglePause: () => dispatch({ type: "togglePause" }),
  };
}
