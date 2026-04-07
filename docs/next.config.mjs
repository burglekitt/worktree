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
  // Expose GEMINI_WORKER_URL to the client-side bundle at build time.
  // Next.js only auto-forwards NEXT_PUBLIC_* vars; the `env` block here opts
  // in a specific var without requiring a naming change.
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
