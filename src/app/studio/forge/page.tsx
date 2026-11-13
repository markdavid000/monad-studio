import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { ForgeTool } from "@/features/forge";

export const metadata: Metadata = { title: toolCopy.forge.name };

export default function ForgePage() {
  return <ForgeTool />;
}
