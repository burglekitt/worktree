# Cloudflare Worker: Gemini API Proxy

This worker runs on Cloudflare Workers and proxies chat requests from the docs
static site to the Google Gemini API, keeping `GEMINI_API_KEY` out of the browser.

## How it fits together

```
Browser (GitHub Pages)  →  POST https://<worker>.workers.dev?model=...
                              ↓
                        Cloudflare Worker  (docs/worker/)
                              ↓
                        Gemini REST API  (SSE stream)
                              ↑
                        SSE stream piped back to browser
```

The static bundle bakes in `GEMINI_WORKER_URL` at build time.
That variable is set as a GitHub repo **variable** (not a secret) and injected
by the `docs-deploy.yml` workflow.

## Local development

**Prerequisite:** `docs/.env.local` must contain your Gemini API key.
Copy `docs/.env.local.example` → `docs/.env.local` and fill it in.

Run the full dev stack (worker + Next.js + watch rebuild) from the repo root:

```bash
pnpm docs:dev
```

Or run them separately:

```bash
# Terminal 1 — worker (http://localhost:8787)
pnpm --filter docs run worker:dev

# Terminal 2 — Next.js (http://localhost:3000)
pnpm --filter docs run dev
```

The Next.js app defaults to `http://localhost:8787` when
`GEMINI_WORKER_URL` is not set locally.

## First-time Cloudflare deployment

> **Done for this project.** The worker is live at
> `https://worktree-gemini-proxy.burglekitt.workers.dev`.
> Steps below are for reference or if you need to redo from scratch.

### 1. Find your Cloudflare Account ID

```bash
npx wrangler whoami
```

Or open [dash.cloudflare.com](https://dash.cloudflare.com) → right sidebar.

### 2. Export credentials for your shell session

```bash
export CLOUDFLARE_API_TOKEN="<your token>"
export CLOUDFLARE_ACCOUNT_ID="<your account id>"
```

### 3. Set the Gemini API key secret on the worker *(one-time)*

Do this **before** deploying if the worker doesn't exist yet — wrangler will
create a stub worker, bind the secret, then you deploy the code on top of it.
Or run it after deploy; either order works.

```bash
pnpm --filter docs run worker:setup-secret
# prompts: "Enter a secret value:" — paste your GEMINI_API_KEY
```

**This is a one-time operation.** Re-run only if you rotate the Gemini API key.
The secret lives in Cloudflare's secret store — it is separate from:
- `GEMINI_API_KEY` in `docs/.env.local` (used by `worker:setup-dev-vars` for local wrangler dev only)
- `GEMINI_API_KEY` in GitHub Secrets (not used here — that was added for future CI if needed)

### 4. Deploy the worker

```bash
pnpm --filter docs run worker:deploy
```

Builds the worker (regenerates `docs-context.ts` from MDX + bundles via tsup)
then deploys. On success wrangler prints:

```
Deployed worktree-gemini-proxy triggers
  https://worktree-gemini-proxy.burglekitt.workers.dev
```

### 5. Set the GitHub repo variable

In your GitHub repo → **Settings → Secrets and variables → Actions →
Variables**, add:

| Name | Value |
|---|---|
| `GEMINI_WORKER_URL` | `https://worktree-gemini-proxy.burglekitt.workers.dev` |

### 6. Trigger a docs rebuild

The `docs-deploy.yml` workflow bakes `GEMINI_WORKER_URL` into the static bundle.
Push a commit or manually trigger:

```
GitHub repo → Actions → Deploy Docs → Run workflow
```

## Redeploying after changes

```bash
pnpm --filter docs run worker:deploy
```

The `worker:build` step regenerates `docs-context.ts` every time, so the
deployed worker always has up-to-date docs content embedded in the system prompt.

## CORS

The worker allows requests from:
- `https://burglekitt.github.io` — production GitHub Pages
- `http://localhost:3000` — local Next.js dev

All other origins receive the production origin in `Access-Control-Allow-Origin`,
so browsers will block unexpected cross-origin requests. Update `CORS_ORIGINS`
in `worker.ts` if you add a custom domain.

## CI auto-deployment (optional)

See `.github/workflows/worker-deploy.yml`. Deploys automatically on pushes to
`main` that change `docs/worker/**`. Requires two GitHub **repository secrets**:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | CF dashboard → My Profile → API Tokens → *Edit Cloudflare Workers* template |
| `CLOUDFLARE_ACCOUNT_ID` | `wrangler whoami` or CF dashboard right sidebar |

## Bundle size

Zero npm dependencies — the worker calls the Gemini REST API directly with
`fetch()`. Typical bundle size: ~30 KB.