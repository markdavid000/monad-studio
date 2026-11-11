"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { layoutCopy } from "./copy";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} aria-label={layoutCopy.toggleTheme}>
      <Sun className="dark:hidden" aria-hidden />
      <Moon className="hidden dark:block" aria-hidden />
    </Button>
  );
}
