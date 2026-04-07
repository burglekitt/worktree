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
  // worker.ts uses only the CF Workers runtime (fetch, Request, Response, URL).
  // No npm dependencies to bundle — zero external stubs needed.
});
