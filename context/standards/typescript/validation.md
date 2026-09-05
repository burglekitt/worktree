# Validation

## Core Rule

Validate all external data at system boundaries. Never trust raw input from users, APIs, or environment variables.

## Preferred Library

**Zod** is the default choice.

**Valibot** is worth evaluating for bundle-size-sensitive contexts (significantly smaller than Zod).

## Schema-First Approach

Define the schema once. Derive types from it. Share the schema across frontend and backend.

```ts
// shared/schemas/user.schema.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
```

## Validate at Boundaries

```ts
// API response — validate before using
const response = await fetch("/api/users/1");
const raw = await response.json();
const user = userSchema.parse(raw); // throws if invalid

// Form submission — validate before submitting
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
});

// Environment variables
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
```

## Safe Parse for Non-Throwing Validation

```ts
const result = userSchema.safeParse(raw);

if (!result.success) {
  // result.error.issues contains field-level errors
  return { error: result.error.flatten() };
}

const user = result.data;
```

## Shared FE/BE Schemas

Place shared schemas in a location accessible to both frontend and backend:

```
shared/
  schemas/
    user.schema.ts
    invoice.schema.ts
    auth.schema.ts
```

In a monorepo, export from a shared package:

```ts
import { userSchema } from "@acme/schemas";
```

## DO NOT

- Accept `any` from `JSON.parse` without parsing through a schema
- Duplicate validation logic in both frontend and backend
- Use manual `if` chains to validate complex shapes — use a schema library
- Rely on TypeScript types alone for runtime safety — types are erased at runtime

## PRIORITY

```
Schema-first > Manual validation > No validation
```

## See Also

- [`rules.md`](rules.md) — general TS rules including no `any`
- [`../security/validation.md`](../security/validation.md) — validating at API boundaries
- [`../architecture/api-design.md`](../architecture/api-design.md) — shared schemas across FE/BE
- [`../react/forms.md`](../react/forms.md) — Zod schemas with TanStack/RHF forms
