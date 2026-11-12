import { darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";

const shared = { borderRadius: "small", fontStack: "system", overlayBlur: "small" } as const;

export function useRainbowTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "light"
    ? lightTheme({ ...shared, accentColor: "#171717", accentColorForeground: "#ffffff" })
    : darkTheme({ ...shared, accentColor: "#f5f5f5", accentColorForeground: "#121114" });
}
