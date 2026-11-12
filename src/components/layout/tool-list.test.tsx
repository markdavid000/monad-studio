import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tools } from "@/config/tools";
import { layoutCopy } from "./copy";
import { ToolList } from "./tool-list";

describe("ToolList", () => {
  it("lists every tool with what it outputs", () => {
    render(<ToolList headingLevel="h2" />);
    for (const tool of tools) {
      expect(screen.getByRole("heading", { level: 2, name: tool.name })).toBeInTheDocument();
      expect(screen.getByText(tool.output)).toBeInTheDocument();
    }
  });

  it("links only the tools whose route exists", () => {
    render(<ToolList headingLevel="h2" />);
    for (const tool of tools) {
      const heading = screen.getByRole("heading", { level: 2, name: tool.name });
      const link = within(heading).queryByRole("link");
      if (tool.href) {
        expect(link).toHaveAttribute("href", tool.href);
      } else {
        expect(link).toBeNull();
      }
    }
  });

  it("marks tools that are not available yet", () => {
    render(<ToolList headingLevel="h2" />);
    const pending = tools.filter((tool) => !tool.href).length;
    expect(screen.queryAllByText(layoutCopy.comingNext)).toHaveLength(pending);
  });
});
