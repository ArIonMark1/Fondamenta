import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true, // "@/..." → src/... (from tsconfig.json)
    alias: {
      // `server-only` throws outside a React Server bundle; tests import server modules directly.
      "server-only": fileURLToPath(new URL("./tests/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/setup/global-mongo.ts"],
    setupFiles: ["./tests/setup/env.ts"],
    // Tests that simulate an unreachable DB wait for the driver's server-selection timeout.
    testTimeout: 20_000,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
