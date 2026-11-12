import { darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";

const shared = { borderRadius: "small", fontStack: "system", overlayBlur: "small" } as const;

export function useRainbowTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "light"
    ? lightTheme({ ...shared, accentColor: "#6e54e8", accentColorForeground: "#ffffff" })
    : darkTheme({ ...shared, accentColor: "#9b8afb", accentColorForeground: "#121114" });
}
