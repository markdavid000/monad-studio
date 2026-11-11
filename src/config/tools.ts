import { toolCopy } from "./copy";

type ToolSlug = keyof typeof toolCopy;

export interface Tool {
  slug: ToolSlug;
  name: string;
  summary: string;
  output: string;
  href?: `/studio/${ToolSlug}`;
}

export const tools: readonly Tool[] = [
  { slug: "monguard", ...toolCopy.monguard },
  { slug: "gaslens", ...toolCopy.gaslens },
  { slug: "forge", ...toolCopy.forge },
  { slug: "sentinel", ...toolCopy.sentinel },
  { slug: "paradebug", ...toolCopy.paradebug },
];

export type LinkedTool = Tool & Required<Pick<Tool, "href">>;

export function isLinked(tool: Tool): tool is LinkedTool {
  return tool.href !== undefined;
}
