import { toolCopy } from "./copy";

type ToolSlug = keyof typeof toolCopy;

export interface Tool {
  slug: ToolSlug;
  name: string;
  summary: string;
  output: string;
  href?: `/studio/${ToolSlug}`;
}

export const toolBySlug: Record<ToolSlug, Tool> = {
  monguard: { slug: "monguard", ...toolCopy.monguard },
  gaslens: { slug: "gaslens", ...toolCopy.gaslens },
  forge: { slug: "forge", ...toolCopy.forge },
  sentinel: { slug: "sentinel", ...toolCopy.sentinel },
  paradebug: { slug: "paradebug", ...toolCopy.paradebug },
};

export const tools: readonly Tool[] = Object.values(toolBySlug);

export type LinkedTool = Tool & Required<Pick<Tool, "href">>;

export function isLinked(tool: Tool): tool is LinkedTool {
  return tool.href !== undefined;
}
