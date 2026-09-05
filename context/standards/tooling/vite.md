# Vite

## Purpose

Vite is the preferred build tool for React applications and libraries. It provides fast dev-server HMR and optimized production builds.

## Recommended Config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // resolves ~/... aliases from tsconfig paths
  ],
  build: {
    target: "es2022",
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
```

## Path Aliases

Use `~/` for absolute imports. Configure in `tsconfig.json` and resolve with `vite-tsconfig-paths`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

```ts
// Usage
import { InvoiceTable } from "~/features/invoices/InvoiceTable";
import { formatCurrency } from "~/shared/utils/format-currency";
```

## Environment Variables

Vite exposes env vars prefixed with `VITE_` to the client:

```
VITE_API_BASE_URL=https://api.example.com
```

```ts
// Access in code
const apiBase = import.meta.env.VITE_API_BASE_URL;
```

Validate env vars at startup:

```ts
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
```

## Vitest Integration

Vitest runs inside Vite — same config, same transforms:

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom";
```

## Code Splitting

Vite splits by dynamic import automatically:

```ts
const InvoicePage = lazy(() => import("~/features/invoices/InvoicePage"));
```

For manual chunk control:

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
      },
    },
  },
},
```

## DO NOT

- Use `process.env` in Vite client code — use `import.meta.env`
- Commit `.env` files with secrets — use `.env.local` (gitignored)
- Disable sourcemaps in production without good reason

## See Also

- [`biome.md`](biome.md) — lint and format
- [`dependencies.md`](dependencies.md) — bundle impact tools
- [`../security/secrets.md`](../security/secrets.md) — env var validation
- [`../react/testing.md`](../react/testing.md) — Vitest runs inside Vite
