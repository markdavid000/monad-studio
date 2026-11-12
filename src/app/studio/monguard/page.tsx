import type { Metadata } from "next";
import { MonguardTool } from "@/features/monguard";
import { toolCopy } from "@/config/copy";

export const metadata: Metadata = { title: toolCopy.monguard.name };

export default function MonguardPage() {
  return <MonguardTool />;
}
