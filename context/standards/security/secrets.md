# Secrets Management

## Core Rules

- Never commit secrets to version control
- Never log secrets
- Never expose backend secrets to the client
- Rotate secrets that have been compromised or accidentally exposed

## Environment Variables

Store secrets in environment variables. Never hardcode them.

```
# .env.local (gitignored — for local development only)
DATABASE_URL=postgres://user:password@localhost:5432/mydb
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

```
# .env.example (committed — shows required vars without values)
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
```

## `.gitignore`

Always include:

```gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

## Validate at Startup

```ts
// lib/env.ts (server-only)
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
```

Fail fast on startup if required secrets are missing or malformed.

## Client vs. Server Secrets

| Type | Where | Prefix (Vite/Next.js) | Example |
|---|---|---|---|
| Server-only | Server environment | No prefix | `DATABASE_URL`, `JWT_SECRET` |
| Client-safe | Client environment | `VITE_` / `NEXT_PUBLIC_` | `VITE_API_BASE_URL` |

Never put a secret key in a `VITE_` or `NEXT_PUBLIC_` variable — it will be embedded in the client bundle.

## CI/CD Secrets

- Use the CI provider's secret store (GitHub Actions secrets, Vercel env vars, etc.)
- Use separate secrets for each environment (dev, staging, production)
- Limit secret access to only the jobs that need them

## Secret Scanning

- Enable GitHub's secret scanning on all repositories
- Add `gitleaks` or `truffleHog` to pre-commit hooks for local detection

```bash
# Install gitleaks pre-commit hook
brew install gitleaks
gitleaks protect --staged
```

## If a Secret Is Exposed

1. Rotate it immediately — assume it has been compromised
2. Revoke the old secret in the provider's dashboard
3. Audit access logs for unauthorized use
4. Update all environments with the new secret
5. Review git history and remove the commit from public branches if possible

## DO NOT

- Hardcode API keys, passwords, or tokens in source code
- Log secrets (even in debug mode)
- Pass secrets as command-line arguments (visible in process list)
- Store secrets in `localStorage` or cookies without encryption
- Use the same secret across environments

## See Also

- [`auth.md`](auth.md) — token storage and rotation
- [`api-security.md`](api-security.md) — error responses that don't leak details
- [`../tooling/observability.md`](../tooling/observability.md) — redacting before logging
