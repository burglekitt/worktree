import path from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const withNextra = nextra({});
const isProduction = process.env.NODE_ENV === "production";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "..");

export default withNextra({
  output: "export",
  basePath: isProduction ? "/worktree" : "",
  // The worker URL is sourced from GEMINI_WORKER_URL, which should be set in .env.local
  env: {
    GEMINI_WORKER_URL: process.env.GEMINI_WORKER_URL ?? "",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.tsx",
    },
    root: workspaceRoot,
  },
});
