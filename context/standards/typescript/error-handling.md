# Error Handling

## Core Rules

- Never swallow errors silently
- Never hide the original error context
- Never replace a specific error with a generic one
- Preserve HTTP status codes and original payloads
- Validate inputs before state transitions

## DO

```ts
// Preserve original error context
try {
  await db.user.create({ data });
} catch (error) {
  throw new DatabaseError("Failed to create user", { cause: error });
}

// Use custom error classes for categorized errors
class NotFoundError extends Error {
  readonly statusCode = 404;
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = "NotFoundError";
  }
}

// Log with context, not just a message
logger.error("Invoice creation failed", {
  userId,
  invoiceData,
  error: err.message,
});
```

## DO NOT

```ts
// BAD — swallows the error
try {
  await riskyOperation();
} catch {
  // silent
}

// BAD — loses original context
try {
  await riskyOperation();
} catch {
  throw new Error("Something went wrong");
}

// BAD — catches too broadly
try {
  const user = await fetchUser(id);
  const profile = await fetchProfile(user.profileId);
  const invoices = await fetchInvoices(user.id);
} catch (error) {
  // which operation failed? unknown
  console.error(error);
}
```

## Async Rules

### Prefer async/await Over .then() Chains

For sequential async flow, `async/await` is far more readable than chained `.then().catch()`. Reserve `.then()` / `.catch()` for fire-and-forget side effects.

```ts
// GOOD — linear, easy to follow, errors propagate naturally
async function loadDashboard(userId: string) {
  const user = await fetchUser(userId);
  const profile = await fetchProfile(user.profileId);
  const invoices = await fetchInvoices(user.id);
  return { user, profile, invoices };
}

// BAD — nested .then chains, harder to read and reason about
function loadDashboard(userId: string) {
  return fetchUser(userId)
    .then((user) =>
      fetchProfile(user.profileId).then((profile) =>
        fetchInvoices(user.id).then((invoices) => ({ user, profile, invoices })),
      ),
    )
    .catch((error) => {
      // which step failed? unclear
    });
}
```

### Always Await or Return

```ts
// GOOD
async function loadUser(id: string) {
  const user = await fetchUser(id);
  return user;
}

// BAD — floating promise, errors lost
async function loadUser(id: string) {
  fetchUser(id); // unawaited
}
```

### Fire-and-Forget Operations

`.catch()` is appropriate when you intentionally don't await:

```ts
sendAnalyticsEvent(payload).catch((error) => {
  logger.warn("Analytics event failed", { error });
});

// If you genuinely don't care about errors, mark intent with `void`
void sendAnalyticsEvent(payload);
```

### Parallel Operations

Run independent async operations in parallel with `Promise.all`:

```ts
// GOOD — parallel, faster
const [user, settings, invoices] = await Promise.all([
  fetchUser(userId),
  fetchSettings(userId),
  fetchInvoices(userId),
]);

// BAD — sequential when there's no dependency between calls
const user = await fetchUser(userId);
const settings = await fetchSettings(userId);
const invoices = await fetchInvoices(userId);
```

Use `Promise.allSettled` when some failures are acceptable and you want all results regardless.

## Custom Error Classes

```ts
class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message: string, readonly fields: Record<string, string[]>) {
    super(message, 422);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} '${id}' not found`, 404);
  }
}
```

## User-Facing Errors

Every user-facing error must:

1. **Explain the failure** — what went wrong, specifically
2. **Explain the next step** — what the user should do
3. **Be actionable** — give the user something they can do

```ts
// BAD
"Something went wrong. Please try again."

// GOOD
"We couldn't save your invoice. Check your internet connection and try again.
If the problem continues, contact support with reference #INV-1234."
```

## Result Pattern (Optional)

For operations where errors are expected and part of normal flow:

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function parseUser(raw: unknown): Promise<Result<User>> {
  const result = userSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: new ValidationError(result.error.message) };
  }
  return { ok: true, value: result.data };
}
```

## PRIORITY

```
Preserve context > Specific messages > Actionable user guidance
```

## See Also

- [`../react/error-boundaries.md`](../react/error-boundaries.md) — catching render-time errors
- [`../tooling/observability.md`](../tooling/observability.md) — structured logging, error monitoring
- [`../security/api-security.md`](../security/api-security.md) — safe error responses
- [`validation.md`](validation.md) — preventing errors via input validation
