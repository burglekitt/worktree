# TypeScript Anti-Patterns

## `any`

```ts
// BAD — erases all type safety
function process(data: any) {
  return data.value;
}

// GOOD — use unknown and narrow
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    return data.value;
  }
  throw new Error("Unexpected data shape");
}
```

## Type Assertions

```ts
// BAD — silences the compiler without verification
const user = JSON.parse(raw) as User;

// GOOD — validate before using
const user = userSchema.parse(JSON.parse(raw));
```

## Enums

```ts
// BAD — compiled JS artifact, not tree-shakeable, verbose
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// GOOD — plain union, zero runtime cost
type Status = "ACTIVE" | "INACTIVE";
```

## DTO Duplication

```ts
// BAD — same shape defined twice
// api/users.ts
interface ApiUser { id: string; name: string; }

// frontend/types.ts
interface FrontendUser { id: string; name: string; }

// GOOD — single schema, inferred types
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;
```

## Type Gymnastics

```ts
// BAD — deeply conditional mapped types that take 10 minutes to understand
type DeepPartialReadonly<T> =
  T extends object
    ? { readonly [K in keyof T]?: DeepPartialReadonly<T[K]> }
    : T;

// If you need this, ask whether the data model is the real problem
```

## `@ts-ignore` Without Explanation

```ts
// BAD
// @ts-ignore
doSomethingWeird(value);

// ACCEPTABLE — only when necessary, always with context
// @ts-expect-error — third-party type definition is wrong, see github.com/foo/bar/issues/123
doSomethingWeird(value);
```

## Non-null Assertions Without Verification

```ts
// BAD — crashes at runtime if undefined
const name = user!.profile!.name;

// GOOD
const name = user?.profile?.name ?? "Anonymous";
```

## `object` or `{}` as a Type

```ts
// BAD — accepts almost anything
function format(value: object): string { ... }
function format(value: {}): string { ... }

// GOOD — be explicit
function format(value: Record<string, string>): string { ... }
```

## See Also

- [`rules.md`](rules.md) — the positive rules these anti-patterns violate
- [`validation.md`](validation.md) — runtime validation for `unknown` data
- [`error-handling.md`](error-handling.md) — async, throwing, and preserving error context
