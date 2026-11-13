import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { MonguardDemo } from "@/features/monguard";
import { demoCopy } from "../../copy";

export const metadata: Metadata = {
  title: `${toolCopy.monguard.name} ${demoCopy.titleSuffix}`,
  description: demoCopy.monguardDescription,
};

export default function MonguardDemoPage() {
  return <MonguardDemo />;
}
