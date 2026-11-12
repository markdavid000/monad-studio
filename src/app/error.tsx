"use client";

import { Button } from "@/components/ui/button";
import { useReportError } from "@/hooks/use-report-error";
import { appCopy } from "./copy";

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useReportError(error);

  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-6 py-20"
    >
      <h1 className="text-2xl font-semibold tracking-tight">{appCopy.errorTitle}</h1>
      <p className="text-muted-foreground">{appCopy.errorBody}</p>
      <Button onClick={retry}>{appCopy.retry}</Button>
    </main>
  );
}
