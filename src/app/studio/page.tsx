import type { Metadata } from "next";
import { ToolList } from "@/components/layout/tool-list";
import { appCopy } from "../copy";

export const metadata: Metadata = { title: appCopy.studioTitle };

export default function StudioPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{appCopy.studioTitle}</h1>
        <p className="text-muted-foreground">{appCopy.studioLead}</p>
      </div>
      <ToolList headingLevel="h2" />
    </div>
  );
}
