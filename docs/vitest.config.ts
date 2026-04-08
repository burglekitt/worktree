import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // docs-context.ts is generated at build time and gitignored.
      // Redirect to a committed stub so worker tests run without a build step.
      "./docs-context.js": resolve(__dirname, "worker/docs-context.stub.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
  },
});
