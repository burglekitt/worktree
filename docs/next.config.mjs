import path from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const withNextra = nextra({});
const isProduction = process.env.NODE_ENV === "production";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "..");

export default withNextra({
  // output: "export", // !! TODO Static site vs routes for api..
  // !! TODO may need to fully ditch the route.ts and put everything up in some cloudflare worker
  basePath: isProduction ? "/worktree" : "",
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
