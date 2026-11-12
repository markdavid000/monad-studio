import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tools } from "@/config/tools";
import { layoutCopy } from "./copy";
import { StudioSidebar } from "./studio-sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/studio" }));
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: undefined, isConnected: false }),
  useBlockNumber: () => ({ data: undefined, isError: false }),
}));

describe("StudioSidebar", () => {
  it("marks the workspace as the current page", () => {
    render(<StudioSidebar />);
    expect(screen.getByRole("link", { name: layoutCopy.workspace })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("links only the tools that exist and marks the rest as soon", () => {
    render(<StudioSidebar />);
    for (const tool of tools) {
      const link = screen.queryByRole("link", { name: tool.name });
      if (tool.href) expect(link).toHaveAttribute("href", tool.href);
      else expect(link).toBeNull();
    }
    expect(screen.getAllByText(layoutCopy.soon)).toHaveLength(tools.filter((t) => !t.href).length);
  });
});
