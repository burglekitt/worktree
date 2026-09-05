# API Security

## Core Rules

- Validate all input (see [validation.md](validation.md))
- Authenticate all protected routes
- Authorize every resource access
- Return minimal, appropriate HTTP status codes
- Rate limit public and sensitive endpoints
- Never expose internal error details to clients

## HTTP Status Codes

Use precise status codes:

| Code | When |
|---|---|
| `200` | Successful GET, PATCH, PUT |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no content) |
| `400` | Malformed request (bad JSON, missing required field) |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict (duplicate, optimistic lock failure) |
| `422` | Validation error (well-formed but invalid data) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

## Error Responses

Return structured errors. Never expose stack traces or internal details:

```ts
// BAD — exposes internals
res.status(500).json({ error: error.stack });

// GOOD — structured, safe
res.status(422).json({
  error: "Validation failed",
  fields: result.error.flatten().fieldErrors,
});
```

## Rate Limiting

Apply rate limiting to all public APIs:

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 req/min
});

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "unknown";
  const { success, limit, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
    });
  }
}
```

## CORS

Configure CORS explicitly. Do not allow all origins in production:

```ts
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? ["https://app.example.com"]
    : ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};
```

## SQL Injection Prevention

Use parameterized queries. Prisma handles this automatically:

```ts
// SAFE — Prisma parameterizes automatically
const user = await db.user.findUnique({ where: { email } });

// DANGEROUS — never concatenate user input into raw SQL
const user = await db.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

// SAFE — use $queryRaw with tagged template (automatically parameterized)
const user = await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

## Content Security Policy

Set a Content Security Policy header to mitigate XSS:

```ts
// Next.js — next.config.ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // tighten after audit
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join("; "),
  },
];
```

## DO NOT

- Expose database errors or stack traces to the client
- Trust user-supplied IDs for authorization
- Use `*` for CORS `Access-Control-Allow-Origin` in production
- Accept file uploads without size and MIME type validation
- Log request bodies that may contain passwords or payment data

## See Also

- [`validation.md`](validation.md) — input validation patterns
- [`auth.md`](auth.md) — authentication and authorization
- [`../typescript/error-handling.md`](../typescript/error-handling.md) — structured error responses
- [`../architecture/api-design.md`](../architecture/api-design.md) — error shape conventions
