# API Design and Client Patterns

## Core Rules

- API types are generated or inferred — never duplicated by hand
- Validate at the boundary on both sides (server validates incoming, client validates responses)
- Use a consistent error response shape across all endpoints
- Versioning is explicit when contracts change in breaking ways
- Mock servers in development — do not block frontend work on backend availability

## Choosing an API Layer

| Approach | Use when |
|---|---|
| **tRPC** | Same team owns FE and BE, both in TypeScript — end-to-end type safety, no codegen step |
| **OpenAPI + generated client** | Polyglot backend, public API, or external consumers |
| **GraphQL** | Many client types with different field needs, or complex relational queries |
| **Hand-written REST + Zod** | Small project, no FE/BE coordination needed, simple endpoints |

Pick one per service. Mixing approaches creates two type pipelines to maintain.

## tRPC Pattern

```ts
// server/router.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  invoice: t.router({
    list: t.procedure
      .input(z.object({ status: z.enum(["all", "open", "paid"]).default("all") }))
      .query(({ input }) => db.invoice.findMany({ where: { status: input.status } })),

    create: t.procedure
      .input(createInvoiceSchema)
      .mutation(({ input, ctx }) =>
        db.invoice.create({ data: { ...input, userId: ctx.userId } }),
      ),
  }),
});

export type AppRouter = typeof appRouter;
```

```ts
// client — types flow from the server router definition
const invoices = await trpc.invoice.list.query({ status: "open" });
// invoices is fully typed; no manual DTO
```

## OpenAPI Pattern

For polyglot or public APIs:

```bash
# Generate a typed client from an OpenAPI spec
pnpm dlx openapi-typescript ./openapi.yaml -o ./src/lib/api-types.ts
```

Use a small fetch wrapper that validates with the generated types:

```ts
import type { paths } from "~/lib/api-types";
import createClient from "openapi-fetch";

export const api = createClient<paths>({ baseUrl: env.VITE_API_BASE_URL });

const { data, error } = await api.GET("/invoices", { params: { query: { status: "open" } } });
```

## Hand-Written Fetch + Zod

For small projects without a generated client:

```ts
import { z } from "zod";

const invoiceSchema = z.object({ id: z.string(), title: z.string(), amount: z.number() });
const invoicesResponseSchema = z.object({ items: invoiceSchema.array(), nextCursor: z.string().nullable() });

export async function fetchInvoices(cursor?: string) {
  const url = new URL("/api/invoices", env.VITE_API_BASE_URL);
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  return invoicesResponseSchema.parse(await response.json());
}
```

## Standard Error Response Shape

Use one error shape across all endpoints:

```ts
// shared/schemas/api-error.schema.ts
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),              // machine-readable: "NOT_FOUND", "VALIDATION_FAILED"
    message: z.string(),           // human-readable, safe to show
    details: z.record(z.unknown()).optional(),  // field errors, etc.
    requestId: z.string().optional(),
  }),
});
```

Server example:

```ts
return res.status(422).json({
  error: {
    code: "VALIDATION_FAILED",
    message: "Some fields are invalid",
    details: result.error.flatten().fieldErrors,
    requestId: req.id,
  },
});
```

## Pagination

Prefer **cursor-based pagination** for performance and stability with mutable datasets:

```ts
// Request: GET /invoices?cursor=eyJpZCI6...&limit=20
// Response:
{
  items: Invoice[],
  nextCursor: string | null,  // null when at end
}
```

Use **offset/page pagination** only for small, stable datasets where the user expects page numbers (admin tables, search results).

## Versioning

When making a breaking change:

- **Additive change** (new optional field, new endpoint) — no version bump needed
- **Breaking change** (removed field, changed type, removed endpoint) — bump the API version

Common strategies:
- URL prefix: `/v1/invoices`, `/v2/invoices`
- Header: `Accept: application/vnd.acme.v2+json`

Keep the old version working for one deprecation cycle (typically 1–2 releases). Document the migration path.

## Mock Servers

Frontend should never be blocked on backend availability.

Options:
- **MSW** (Mock Service Worker) — intercepts fetch at the browser/Node level; same handlers in tests and dev
- **Prism** — runs an OpenAPI spec as a mock server
- **tRPC** — type-safe mocks via `@trpc/react-query`'s `createTRPCMsw`

```ts
// MSW handler
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/invoices", () =>
    HttpResponse.json({
      items: [{ id: "1", title: "Q4 Report", amount: 500 }],
      nextCursor: null,
    }),
  ),
];
```

## Idempotency

For mutations that might be retried (network errors, optimistic UI), accept an `Idempotency-Key` header so the same request can be safely sent twice:

```ts
// Client
await api.POST("/invoices", {
  body: invoice,
  headers: { "Idempotency-Key": crypto.randomUUID() },
});
```

The server deduplicates on this key for some window (e.g., 24 hours).

## DO NOT

- Hand-write FE types that mirror BE types — generate or infer instead
- Return different error shapes from different endpoints
- Mix snake_case and camelCase in the same API surface
- Expose internal IDs / database errors / stack traces in error responses
- Skip mocking in development — it slows everyone down

## PRIORITY

```
Generated types > Hand-written DTOs
Cursor pagination > Offset pagination
Mock-first frontend > Blocked-on-backend frontend
```

## See Also

- [`typescript/validation.md`](../typescript/validation.md) — schema-driven validation
- [`security/api-security.md`](../security/api-security.md) — status codes, rate limiting, CORS
- [`security/validation.md`](../security/validation.md) — input validation at boundaries
- [`tooling/tanstack-query.md`](../tooling/tanstack-query.md) — TanStack Query patterns
- [`tooling/tanstack-router.md`](../tooling/tanstack-router.md) — route loaders, typed search params
