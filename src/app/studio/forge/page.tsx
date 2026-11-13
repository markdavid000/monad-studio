import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { ForgeTool } from "@/features/forge";

export const metadata: Metadata = { title: toolCopy.forge.name };

export default async function ForgePage({ searchParams }: PageProps<"/studio/forge">) {
  const { run } = await searchParams;
  return <ForgeTool runId={typeof run === "string" ? run : undefined} />;
}
