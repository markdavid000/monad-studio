import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./use-in-view";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

function installObserver() {
  const instances: { callback: Callback; observed: Element[]; disconnect: () => void }[] = [];
  class FakeObserver {
    callback: Callback;
    observed: Element[] = [];
    disconnect = vi.fn();
    constructor(callback: Callback) {
      this.callback = callback;
      instances.push(this);
    }
    observe(node: Element) {
      this.observed.push(node);
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  return instances;
}

function Probe() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  return <div ref={ref}>{isInView ? "in" : "out"}</div>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useInView", () => {
  it("observes its node and starts out of view", () => {
    const instances = installObserver();
    render(<Probe />);
    expect(screen.getByText("out")).toBeInTheDocument();
    expect(instances[0]?.observed).toEqual([screen.getByText("out")]);
  });

  it("turns on once the node intersects, then stops observing", () => {
    const instances = installObserver();
    render(<Probe />);
    const observer = instances[0];
    act(() => observer?.callback([{ isIntersecting: false }]));
    expect(screen.getByText("out")).toBeInTheDocument();
    act(() => observer?.callback([{ isIntersecting: true }]));
    expect(screen.getByText("in")).toBeInTheDocument();
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it("disconnects when unmounted", () => {
    const instances = installObserver();
    const { unmount } = render(<Probe />);
    unmount();
    expect(instances[0]?.disconnect).toHaveBeenCalled();
  });
});
