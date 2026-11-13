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
  monguard: { slug: "monguard", ...toolCopy.monguard, href: "/studio/monguard" },
  gaslens: { slug: "gaslens", ...toolCopy.gaslens, href: "/studio/gaslens" },
  forge: { slug: "forge", ...toolCopy.forge, href: "/studio/forge" },
  sentinel: { slug: "sentinel", ...toolCopy.sentinel },
  paradebug: { slug: "paradebug", ...toolCopy.paradebug },
};

export const tools: readonly Tool[] = Object.values(toolBySlug);
