import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { studioCopy } from "../copy";
import { exampleContracts } from "@/config/examples";
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
  window.localStorage.setItem("monad-studio:seen:workspace", "seen");
});

describe("StudioWorkspace", () => {
  it("explains the screen once on the first visit", async () => {
    window.localStorage.removeItem("monad-studio:seen:workspace");
    const view = render(<StudioWorkspace />);
    const intro = await screen.findByRole("dialog", { name: studioCopy.intro.title });
    expect(intro).toHaveTextContent(studioCopy.intro.points[0].title);
    fireEvent.click(screen.getByRole("button", { name: studioCopy.intro.done }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    view.unmount();
    render(<StudioWorkspace />);
    expect(screen.queryByRole("dialog", { name: studioCopy.intro.title })).toBeNull();
  });

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

  it("opens each tool from the next step actions", () => {
    render(<StudioWorkspace />);
    expect(
      screen.getByRole("link", { name: new RegExp(studioCopy.actions.scan.label) })
    ).toHaveAttribute("href", "/studio/monguard");
    expect(
      screen.getByRole("link", { name: new RegExp(studioCopy.actions.optimise.label) })
    ).toHaveAttribute("href", "/studio/gaslens");
    expect(
      screen.getByRole("link", { name: new RegExp(studioCopy.actions.compile.label) })
    ).toHaveAttribute("href", "/studio/forge");
    expect(screen.queryByText(new RegExp(studioCopy.comingNext))).not.toBeInTheDocument();
  });
});
