import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    env: { SESSION_SECRET: "test-only-secret-that-is-at-least-32-characters-long" },
    include: ["tests/**/*.test.ts"],
  },
});
