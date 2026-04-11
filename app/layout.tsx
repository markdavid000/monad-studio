import type { Metadata } from "next";
import { Outfit, Syne, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MonadStudio — The Complete Developer Environment for Monad",
  description:
    "Write, secure, optimize, deploy, and monitor smart contracts on Monad. The all-in-one developer studio.",
  keywords: ["Monad", "smart contracts", "blockchain", "developer tools", "security", "Web3"],
  openGraph: {
    title: "MonadStudio",
    description: "The complete developer environment for Monad",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${syne.variable} ${jetbrainsMono.variable} font-sans bg-surface-0 text-ink antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#12121F",
                border: "1px solid #1E1E30",
                color: "#F0F0FF",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
