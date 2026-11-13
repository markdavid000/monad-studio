"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DemoNavProps {
  label: string;
  links: readonly { href: string; label: string }[];
}

export function DemoNav({ label, links }: DemoNavProps) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={label}
      className="order-last -mx-2.5 flex w-full items-center gap-1 pb-2 sm:order-none sm:mx-0 sm:ml-2 sm:w-auto sm:pb-0"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={cn(
            "rounded-md px-2.5 py-1 text-sm transition-colors",
            pathname === link.href
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
