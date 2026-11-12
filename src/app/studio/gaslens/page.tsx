import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { GaslensTool } from "@/features/gaslens";

export const metadata: Metadata = { title: toolCopy.gaslens.name };

export default async function GaslensPage({ searchParams }: PageProps<"/studio/gaslens">) {
  const { run } = await searchParams;
  return <GaslensTool runId={typeof run === "string" ? run : undefined} />;
}
