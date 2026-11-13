import type { Metadata } from "next";
import { MonguardTool } from "@/features/monguard";
import { toolCopy } from "@/config/copy";

export const metadata: Metadata = { title: toolCopy.monguard.name };

export default async function MonguardPage({ searchParams }: PageProps<"/studio/monguard">) {
  const { run } = await searchParams;
  const runId = typeof run === "string" && run !== "new" ? run : undefined;
  return <MonguardTool runId={runId} autoRun={run === "new"} />;
}
