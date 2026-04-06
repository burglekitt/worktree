import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["worker.ts"],
  format: ["esm"],
  target: "es2022",
  outDir: "dist",
  clean: true,
  dts: false,
  minify: false,
  sourcemap: false,
  splitting: false,
  shims: false,
  outExtension: () => ({ js: ".js" }),
  // @tanstack/ai and @tanstack/ai-gemini must be bundled into the worker
  // (Cloudflare Workers have no node_modules at runtime)
  noExternal: ["@tanstack/ai", "@tanstack/ai-gemini"],
  external: [
    "fs",
    "path",
    "stream",
    "util",
    "buffer",
    "http",
    "net",
    "url",
    "https",
    "zlib",
    "crypto",
    "fs/promises",
    "stream/promises",
    "fetch-blob",
  ],
});
