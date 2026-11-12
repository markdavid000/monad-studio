import type { Metadata } from "next";
import { StudioWorkspace } from "@/features/studio";
import { appCopy } from "../copy";

export const metadata: Metadata = { title: appCopy.studioTitle };

export default function StudioPage() {
  return <StudioWorkspace />;
}
