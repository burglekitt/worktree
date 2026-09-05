# TypeScript Rules

## DO

- Enable `"strict": true` in all projects — no exceptions
- Prefer union types over enums: `type Status = "active" | "inactive"` not `enum Status`
- Prefer generated API types (from OpenAPI, tRPC, Prisma) over hand-written DTOs
- Use schema-driven validation (Zod) for all external data
- Use explicit, descriptive type names
- Prefer `interface` over `type` for object shapes. Use `type` only when interfaces cannot express what you need (unions, intersections, mapped/conditional types, primitive aliases)
- Prefer `unknown` over `any` for untyped external input
- Prefer `async/await` over `.then().catch()` chains for sequential async flow
- Use `satisfies` operator to validate against a type without widening
- Use `const` assertions for literal types where appropriate

## DO NOT

- Use `any` — use `unknown` and narrow
- Use type assertions (`as SomeType`) unless interfacing with third-party types you cannot change
- Write duplicate DTOs for the same data shape (frontend + backend)
- Perform type gymnastics — if a type is hard to write, the underlying design may be wrong
- Use `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why
- Use `namespace` or `module` declarations in new code

## Function Declarations Over Arrow Expressions

Use `function` declarations for named, module-level, and exported functions (including React components). Use arrow functions for anonymous callbacks and inline handlers.

```ts
// GOOD — named functions use declarations
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return <table>...</table>;
}

// GOOD — anonymous arrows for callbacks and inline handlers
invoices.map((invoice) => invoice.amount);
invoices.filter((invoice) => invoice.status === "open");
<button onClick={() => setOpen(true)}>Open</button>

// BAD — arrow expression assigned to const for a named function
const formatCurrency = (value: number): string => { ... };
const InvoiceTable = ({ invoices }: InvoiceTableProps) => { ... };
```

Reasoning:
- Function declarations are hoisted — usable before their definition in the file
- Named functions produce clearer stack traces
- `export function foo()` is easier to scan than `export const foo = () => ...`
- `this` binding is irrelevant for module-level functions

## Interfaces Over Type Aliases

Prefer `interface` for object shapes. Use `type` only when `interface` cannot express what you need.

```ts
// GOOD — interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick: (id: string) => void;
}

// GOOD — type for unions, intersections, mapped/conditional types, primitive aliases
type Status = "active" | "inactive" | "archived";
type UserId = string;
type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
type Nullable<T> = T | null;

// BAD — type for an object shape that interface would handle
type User = {
  id: string;
  name: string;
};
```

Reasoning:
- Interfaces produce clearer error messages
- Interfaces are open for declaration merging (useful for extending third-party types)
- `extends` is more readable than intersection types
- `interface` signals "this is an object shape" — `type` signals "this could be anything"

## Unions Over Enums

```ts
// BAD
enum Direction {
  North = "NORTH",
  South = "SOUTH",
}

// GOOD
type Direction = "NORTH" | "SOUTH";

// GOOD — const object if you need runtime values
const DIRECTION = {
  North: "NORTH",
  South: "SOUTH",
} as const;
type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
```

## Narrowing Over Assertions

```ts
// BAD
const value = data as User;

// GOOD
if (!isUser(data)) throw new Error("Expected User");
const value = data; // now narrowed to User
```

## Avoiding DTO Duplication

Prefer generating types from the API layer:

```ts
// tRPC — types come from the router
// Prisma — types come from the schema
// OpenAPI — types generated from the spec
// Zod — infer types from schemas

const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>; // single source of truth
```

## satisfies

```ts
const theme = {
  primary: "#0070f3",
  secondary: "#1a1a1a",
} satisfies Record<string, string>;

theme.primary; // string — not widened to Record<string, string>
```

## PRIORITY

```
Type safety > Brevity > Cleverness
```

## See Also

- [anti-patterns.md](anti-patterns.md)
- [validation.md](validation.md)
- [naming.md](naming.md)
- [error-handling.md](error-handling.md)
- [tsconfig/base.json](tsconfig/base.json)
