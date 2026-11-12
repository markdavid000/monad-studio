import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { GaslensTool } from "@/features/gaslens";

export const metadata: Metadata = { title: toolCopy.gaslens.name };

export default function GaslensPage() {
  return <GaslensTool />;
}
