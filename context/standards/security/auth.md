# Authentication and Authorization

## Core Rules

- Authentication confirms identity. Authorization confirms permission. Both are required.
- Never trust client-supplied user IDs or roles without server-side verification
- Always verify authorization on the server — never rely solely on client-side checks
- Use an established auth library — do not build custom auth from scratch

## Preferred Libraries

- **Auth.js** (Next.js) — sessions, OAuth, credentials, magic links
- **Clerk** — managed auth with pre-built UI components
- **Lucia** — lightweight, flexible, self-hosted

## Session Handling

```ts
// Server-side — always verify the session server-side
import { auth } from "~/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  // use session.user.id — never use a userId from the request body
  const invoices = await getInvoicesForUser(session.user.id);
  return Response.json(invoices);
}
```

## Authorization Checks

Always check permissions on the server, for every request:

```ts
async function getInvoice(invoiceId: string, requestingUserId: string) {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new NotFoundError("Invoice", invoiceId);

  // Authorization — verify the user owns this resource
  if (invoice.userId !== requestingUserId) {
    throw new ForbiddenError("You do not have access to this invoice");
  }

  return invoice;
}
```

## Token Storage

| Token Type | Recommended Storage | Avoid |
|---|---|---|
| Session cookies | `HttpOnly`, `Secure`, `SameSite=Lax` cookies | `localStorage` |
| JWT (short-lived) | `HttpOnly` cookie | `localStorage` |
| Refresh tokens | `HttpOnly` cookie | `localStorage` or `sessionStorage` |

`localStorage` is accessible to JavaScript and vulnerable to XSS. Always use `HttpOnly` cookies for auth tokens.

## Password Handling

```ts
import bcrypt from "bcryptjs";

// Hashing
const hash = await bcrypt.hash(plaintext, 12); // min 12 rounds

// Verification — use timing-safe comparison
const isValid = await bcrypt.compare(plaintext, hash);
```

- Never store plaintext passwords
- Use bcrypt, argon2, or scrypt — not MD5 or SHA-1
- Minimum 12 rounds for bcrypt

## CSRF Protection

- Use `SameSite=Lax` or `SameSite=Strict` on session cookies
- Use CSRF tokens for state-changing requests if cookies are `SameSite=None`
- Auth.js and Clerk handle CSRF automatically

## Rate Limiting Auth Endpoints

Apply rate limiting to:
- Login endpoints
- Password reset endpoints
- OTP/magic link endpoints

```ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 attempts per 15 minutes
});

const { success } = await ratelimit.limit(ip);
if (!success) return new Response("Too many attempts", { status: 429 });
```

## DO NOT

- Use the user's ID from request body for authorization decisions — always use the server session
- Return different HTTP status codes for "user not found" vs. "wrong password" (user enumeration)
- Log passwords or tokens
- Implement custom crypto or JWT libraries

## See Also

- [`secrets.md`](secrets.md) — secret storage and rotation
- [`api-security.md`](api-security.md) — rate limiting and CORS
- [`validation.md`](validation.md) — validating auth requests
