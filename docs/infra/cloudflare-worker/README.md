Cloudflare Worker proxy for OpenRouter

Overview

This small Cloudflare Worker forwards chat requests from the docs site to OpenRouter's HTTP API while keeping your API key secret.

Files

- `worker.js` — the worker source.

Secrets to set

- `OPENROUTER_API_KEY` — your OpenRouter API key (already in your GitHub secrets).
- `CF_ACCOUNT_ID` and `CF_API_TOKEN` (if you plan to use `wrangler` / GitHub Actions to publish the worker).

Quick deploy (local wrangler)

1. Install wrangler: `npm i -g wrangler`.
2. Log in or configure: `wrangler login` or set `CF_ACCOUNT_ID` and `CF_API_TOKEN` as env vars.
3. Set the secret for the worker:

```bash
wrangler secret put OPENROUTER_API_KEY --name OPENROUTER_API_KEY
```

4. Publish the worker (assumes a `wrangler.toml` configured):

```bash
wrangler publish docs/infra/cloudflare-worker/worker.js --name worktree-openrouter-proxy
```

GitHub Actions

You can add a workflow to publish the worker on push or via `workflow_dispatch`. The workflow needs `CF_ACCOUNT_ID` and `CF_API_TOKEN` and should also set `OPENROUTER_API_KEY` for the worker.

Client configuration

After deploying the worker, set your docs client to call the worker URL (e.g. `https://worktree-openrouter-proxy.example.workers.dev/openrouter`) instead of the Next.js `/api/openrouter` route.

Security notes

- Keep `OPENROUTER_API_KEY` secret in the provider's secret store.
- Update `ALLOWED_MODELS` in `worker.js` to match the exact models your OpenRouter API key can access.
- Consider additional rate-limiting and authentication if the proxy is public.
