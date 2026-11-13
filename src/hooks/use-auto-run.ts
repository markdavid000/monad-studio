import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function useAutoRun(isReady: boolean, run: () => void) {
  const router = useRouter();
  const pathname = usePathname();
  const hasRun = useRef(false);
  const latestRun = useRef(run);

  useEffect(() => {
    latestRun.current = run;
  });

  useEffect(() => {
    if (!isReady || hasRun.current) return;
    hasRun.current = true;
    router.replace(pathname);
    latestRun.current();
  }, [isReady, pathname, router]);
}
