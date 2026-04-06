#!/usr/bin/env node
/**
 * setup-dev-vars.mjs
 *
 * Reads GEMINI_API_KEY from docs/.env.local and writes it to
 * docs/infra/cloudflare-worker/.dev.vars so that `wrangler dev`
 * can access the key during local development.
 *
 * .dev.vars is gitignored — it holds the actual secret.
 * .dev.vars.example (committed) shows the required format.
 *
 * Run automatically via: pnpm run worker:setup-dev-vars
 * (called by dev:with-worker before starting concurrent processes)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(__dirname, "..");
const envLocalPath = join(docsRoot, ".env.local");
const devVarsPath = join(docsRoot, "infra/cloudflare-worker/.dev.vars");

if (!existsSync(envLocalPath)) {
  console.warn(
    "[setup-dev-vars] docs/.env.local not found — worker will start without GEMINI_API_KEY.\n" +
      "  Copy docs/.env.local.example to docs/.env.local and fill in your key.",
  );
  process.exit(0);
}

const envContent = readFileSync(envLocalPath, "utf8");

// Extract GEMINI_API_KEY — matches KEY=value (no quotes required, strips inline comments)
const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
if (!match) {
  console.warn(
    "[setup-dev-vars] GEMINI_API_KEY not found in docs/.env.local — worker will start without it.",
  );
  process.exit(0);
}

const apiKey = match[1].trim().replace(/\s*#.*$/, ""); // strip inline comment
writeFileSync(devVarsPath, `GEMINI_API_KEY=${apiKey}\n`, "utf8");
console.log(
  "[setup-dev-vars] Wrote GEMINI_API_KEY to infra/cloudflare-worker/.dev.vars",
);
