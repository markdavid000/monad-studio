import { useReducer } from "react";

interface ShowcaseState {
  active: number;
  isPaused: boolean;
}

type ShowcaseAction =
  { type: "select"; index: number } | { type: "advance" } | { type: "togglePause" };

function reducer(count: number) {
  return function showcaseReducer(state: ShowcaseState, action: ShowcaseAction): ShowcaseState {
    switch (action.type) {
      case "select":
        return { ...state, active: (action.index + count) % count };
      case "advance":
        return { ...state, active: (state.active + 1) % count };
      case "togglePause":
        return { ...state, isPaused: !state.isPaused };
    }
  };
}

export function useShowcase(count: number) {
  const [state, dispatch] = useReducer(reducer(count), { active: 0, isPaused: false });

  return {
    active: state.active,
    isPaused: state.isPaused,
    select: (index: number) => dispatch({ type: "select", index }),
    advance: () => dispatch({ type: "advance" }),
    togglePause: () => dispatch({ type: "togglePause" }),
  };
}
