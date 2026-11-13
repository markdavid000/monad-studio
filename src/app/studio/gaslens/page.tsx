import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { GaslensTool } from "@/features/gaslens";

export const metadata: Metadata = { title: toolCopy.gaslens.name };

export default async function GaslensPage({ searchParams }: PageProps<"/studio/gaslens">) {
  const { run } = await searchParams;
  const runId = typeof run === "string" && run !== "new" ? run : undefined;
  return <GaslensTool runId={runId} autoRun={run === "new"} />;
}
