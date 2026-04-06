Cloudflare Worker: Gemini proxy

This worker proxies chat requests from the static docs site to Google Gemini using the TanStack Gemini adapter.

Local development

- Ensure `wrangler` is installed (we include it in devDependencies for `docs`).
- Put your local Gemini key in `docs/.env.local` as `GEMINI_API_KEY` for local development.
- Run the worker locally with:

```bash
pnpm --filter docs run worker:dev
```

This will start a local worker listening on `http://localhost:8787` by default. Start the docs dev server separately:

```bash
pnpm --filter docs dev
```

Production

1. Login to Cloudflare: `wrangler login`
2. Add the secret:

```bash
wrangler secret put GEMINI_API_KEY --name GEMINI_API_KEY
```

3. Publish:

```bash
pnpm --filter docs run worker:publish
```

Notes

- Update CORS `Access-Control-Allow-Origin` in `worker.ts` before deploying to production.
- If `@tanstack/ai-gemini` cannot be bundled for the worker runtime, we will fallback to a direct HTTP proxy implementation.
# TODO need to rework according to tanstack ai-gemini