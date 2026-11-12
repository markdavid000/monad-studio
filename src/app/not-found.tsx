import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appCopy } from "./copy";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-6 py-20"
    >
      <h1 className="text-2xl font-semibold tracking-tight">{appCopy.notFoundTitle}</h1>
      <p className="text-muted-foreground">{appCopy.notFoundBody}</p>
      <Button asChild variant="outline">
        <Link href="/">{appCopy.backHome}</Link>
      </Button>
    </main>
  );
}
