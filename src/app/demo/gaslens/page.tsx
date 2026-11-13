import type { Metadata } from "next";
import { toolCopy } from "@/config/copy";
import { GaslensDemo } from "@/features/gaslens";
import { demoCopy } from "../../copy";

export const metadata: Metadata = {
  title: `${toolCopy.gaslens.name} ${demoCopy.titleSuffix}`,
  description: demoCopy.gaslensDescription,
};

export default function GaslensDemoPage() {
  return <GaslensDemo />;
}
