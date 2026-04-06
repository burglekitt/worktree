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
    // fetch-blob intentionally NOT here — handled by esbuildPlugins below
  ],
  // CF Workers have native Blob/File — stub out the Node.js fetch-blob polyfill
  // that @google/genai pulls in, so wrangler never needs to resolve it.
  esbuildPlugins: [
    {
      name: "cf-fetch-blob-stub",
      setup(build) {
        build.onResolve({ filter: /^fetch-blob/ }, (args) => ({
          path: args.path,
          namespace: "cf-fetch-blob-stub",
        }));
        build.onLoad(
          { filter: /.*/, namespace: "cf-fetch-blob-stub" },
          (args) => {
            if (args.path === "fetch-blob/from.js") {
              // node-fetch imports: Blob, File, blobFrom, blobFromSync, fileFrom, fileFromSync
              return {
                contents: [
                  "export const Blob = globalThis.Blob;",
                  "export const File = globalThis.File;",
                  "export const blobFrom = async (p) => new globalThis.Blob([await import('node:fs').then(f => f.readFileSync(p))]);",
                  "export const blobFromSync = (p) => new globalThis.Blob([require('fs').readFileSync(p)]);",
                  "export const fileFrom = async (p, t) => new globalThis.File([await import('node:fs').then(f => f.readFileSync(p))], p, { type: t });",
                  "export const fileFromSync = (p, t) => new globalThis.File([require('fs').readFileSync(p)], p, { type: t });",
                  "export default globalThis.Blob;",
                ].join("\n"),
                loader: "js",
              };
            }
            if (args.path === "fetch-blob/file.js") {
              return {
                contents:
                  "export default globalThis.File; export const File = globalThis.File;",
                loader: "js",
              };
            }
            // main fetch-blob
            return {
              contents:
                "export default globalThis.Blob; export const Blob = globalThis.Blob;",
              loader: "js",
            };
          },
        );
      },
    },
  ],
});
