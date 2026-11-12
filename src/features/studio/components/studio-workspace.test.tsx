import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { studioCopy } from "../copy";
import { exampleContracts } from "../examples";
import { StudioWorkspace } from "./studio-workspace";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, isConnected: false }),
  useBlockNumber: () => ({ data: undefined, isError: false }),
}));

function editor() {
  return screen.getByRole("textbox", { name: studioCopy.editorLabel });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("StudioWorkspace", () => {
  it("loads an example into the editor and keeps it in this browser", () => {
    render(<StudioWorkspace />);
    const example = exampleContracts[1];
    fireEvent.click(screen.getByRole("button", { name: new RegExp(example.name) }));
    expect(editor()).toHaveValue(example.source);
    expect(screen.getByRole("button", { name: new RegExp(example.name) })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(window.localStorage.getItem("monad-studio:draft")).toContain(example.name);
  });

  it("restores the saved draft when the workspace opens again", () => {
    window.localStorage.setItem(
      "monad-studio:draft",
      JSON.stringify({ name: "Mine.sol", source: "contract Mine {}" })
    );
    render(<StudioWorkspace />);
    expect(editor()).toHaveValue("contract Mine {}");
    expect(screen.getByText("Mine.sol")).toBeInTheDocument();
  });

  it("clears the draft", () => {
    render(<StudioWorkspace />);
    fireEvent.change(editor(), { target: { value: "contract A {}" } });
    fireEvent.click(screen.getByRole("button", { name: studioCopy.clear }));
    expect(editor()).toHaveValue("");
  });

  it("warns when the source is over the limit", () => {
    render(<StudioWorkspace />);
    fireEvent.change(editor(), { target: { value: "a".repeat(61 * 1024) } });
    expect(screen.getByText(studioCopy.tooLarge)).toBeInTheDocument();
  });

  it("opens MonGuard to scan and marks the tools that are not built yet", () => {
    render(<StudioWorkspace />);
    expect(
      screen.getByRole("link", { name: new RegExp(studioCopy.actions.scan.label) })
    ).toHaveAttribute("href", "/studio/monguard");
    for (const action of [studioCopy.actions.optimise, studioCopy.actions.deploy]) {
      expect(screen.getByRole("button", { name: new RegExp(action.label) })).toBeDisabled();
    }
    expect(screen.getAllByText(new RegExp(studioCopy.comingNext))).toHaveLength(2);
  });
});
