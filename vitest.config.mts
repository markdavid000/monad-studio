import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const SERVER_TESTS = ["src/app/api/**/*.test.ts", "src/lib/server/**/*.test.ts"];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    css: false,
    env: { NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "test-project-id" },
    projects: [
      {
        extends: true,
        test: {
          name: "browser",
          environment: "jsdom",
          setupFiles: ["./vitest.polyfills.ts", "./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: SERVER_TESTS,
        },
      },
      {
        extends: true,
        test: { name: "server", environment: "node", include: SERVER_TESTS },
      },
    ],
  },
});
