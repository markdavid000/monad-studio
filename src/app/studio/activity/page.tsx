import type { Metadata } from "next";
import { ActivityLog } from "@/features/activity";
import { appCopy } from "../../copy";

export const metadata: Metadata = { title: appCopy.activityTitle, robots: { index: false } };

export default function ActivityPage() {
  return <ActivityLog />;
}
