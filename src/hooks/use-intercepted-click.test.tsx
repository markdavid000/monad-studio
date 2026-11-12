import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useInterceptedClick } from "./use-intercepted-click";

function Harness() {
  const entry = useInterceptedClick("[data-studio-entry]");
  return (
    <>
      <a href="/studio" data-studio-entry>
        Open the studio
      </a>
      <a href="#tools">Tools</a>
      <output>{entry.isTriggered ? "triggered" : "idle"}</output>
      <button type="button" onClick={entry.reset}>
        reset
      </button>
    </>
  );
}

describe("useInterceptedClick", () => {
  it("stops a marked link from navigating and reports the click", () => {
    render(<Harness />);
    const link = screen.getByRole("link", { name: "Open the studio" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    act(() => {
      link.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("triggered");
    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(screen.getByRole("status")).toHaveTextContent("idle");
  });

  it("leaves other links and modified clicks alone", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("link", { name: "Tools" }));
    fireEvent.click(screen.getByRole("link", { name: "Open the studio" }), { metaKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("idle");
  });
});
