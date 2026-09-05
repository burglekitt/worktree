# Observability — Logging, Metrics, Errors

## Core Rules

- Log with structured context — never raw strings without metadata
- Never log PII, secrets, or sensitive payloads
- Send errors to an error monitoring service (Sentry, Datadog, etc.)
- Use levels intentionally — `error` is not the same as `warn`
- Correlate logs with a request / trace ID

## Logging Levels

| Level | Use for |
|---|---|
| `error` | An operation failed and the system could not complete the user's intent |
| `warn` | Something unexpected, but the operation continued (degraded mode, fallback) |
| `info` | Normal operational events — startup, shutdown, important state changes |
| `debug` | Detail useful during investigation; off in production |

`error` should page someone. `warn` should not. Use them accordingly.

## Structured Logging

Log objects, not strings. Structured logs are searchable and indexable in any modern log aggregator:

```ts
// BAD — string concatenation, ungrep-able
logger.info(`User ${userId} created invoice ${invoiceId} for $${amount}`);

// GOOD — structured fields
logger.info("invoice.created", {
  userId,
  invoiceId,
  amount,
  currency: "USD",
});
```

Prefer libraries that emit JSON in production:

- **pino** — fast, JSON output, Node.js
- **winston** — flexible, multi-transport
- **slog** — built into Go (mentioned for backend parity)

## Context Propagation

Attach request / trace / user context once at the boundary, then log everywhere:

```ts
// Express / Hono middleware — set request context once
import { AsyncLocalStorage } from "node:async_hooks";

const logContext = new AsyncLocalStorage<{ requestId: string; userId?: string }>();

app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] ?? crypto.randomUUID();
  logContext.run({ requestId, userId: req.user?.id }, () => next());
});

// Anywhere in the request — context is automatically included
function log(message: string, fields: Record<string, unknown> = {}) {
  const ctx = logContext.getStore();
  logger.info(message, { ...ctx, ...fields });
}
```

## What Not to Log

Never log:

- Passwords (even hashed) — exposure risk if logs leak
- Tokens, API keys, session IDs
- Personal data — email, phone, SSN, addresses — unless legally required and access-controlled
- Full request/response bodies that might contain PII
- Stripe / payment data — PCI compliance forbids this

Redact at the source:

```ts
function redactUser(user: User) {
  return { id: user.id, role: user.role }; // omit email, name, etc.
}

logger.info("user.action", { user: redactUser(user), action: "login" });
```

## Error Monitoring

Use a hosted service (Sentry, Datadog, Honeybadger, Bugsnag). Setup once at app entry:

```ts
// app/providers.tsx (client) or server entry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  beforeSend(event) {
    // strip PII before sending
    if (event.user) delete event.user.email;
    return event;
  },
});
```

Send errors from:

- React error boundaries (`onError` callback) — see [`react/error-boundaries.md`](../react/error-boundaries.md)
- Server-side error middleware
- TanStack Query `onError` callbacks
- Unhandled promise rejections / uncaught exceptions

## Correlating Frontend and Backend

Attach a request ID header on every API call. The backend echoes it in responses and logs it. Sentry / Datadog can then stitch frontend + backend traces:

```ts
// Frontend
const requestId = crypto.randomUUID();
const response = await fetch("/api/invoices", {
  headers: { "X-Request-ID": requestId },
});

// On error — include requestId in the error report
Sentry.captureException(error, { tags: { requestId } });
```

## Metrics

For latency, throughput, and business metrics, prefer:

- **Vercel Analytics / Cloudflare Analytics** — out-of-the-box for frontend
- **OpenTelemetry** — vendor-neutral, integrates with most backends
- **Prometheus / Grafana** — self-hosted

Track:
- Request latency (p50, p95, p99)
- Error rate by route
- Critical business events (signups, conversions, purchases)

## Web Vitals

For frontend perceived performance, monitor Core Web Vitals:

```ts
import { onCLS, onFID, onLCP, onINP, onTTFB } from "web-vitals";

function send(metric: { name: string; value: number; id: string }) {
  fetch("/api/metrics", {
    method: "POST",
    body: JSON.stringify(metric),
    headers: { "Content-Type": "application/json" },
  });
}

onCLS(send);
onLCP(send);
onINP(send);
onTTFB(send);
```

## DO NOT

- Log to `console.log` in production code — use a logger
- Catch errors and log without re-throwing (silently swallows failures)
- Log inside hot loops without rate limiting
- Send 100% of traffic to a paid APM — sample appropriately

## PRIORITY

```
Structured logs > String logs
Errors reported > Errors only logged
Correlated traces > Isolated logs
```

## See Also

- [`typescript/error-handling.md`](../typescript/error-handling.md) — error patterns
- [`react/error-boundaries.md`](../react/error-boundaries.md) — React error reporting
- [`security/secrets.md`](../security/secrets.md) — what not to log
