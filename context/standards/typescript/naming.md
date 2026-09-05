# Naming Conventions

## Core Rule

Names should express intent clearly without requiring the reader to trace the code.

## General Rules

| Pattern | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `userProfile`, `isLoading` |
| Functions | `camelCase`, verb-first | `fetchUser`, `formatCurrency` |
| Types / Interfaces | `PascalCase` | `UserProfile`, `InvoiceLineItem` |
| Components | `PascalCase` | `InvoiceTable`, `UserAvatarGroup` |
| Hooks | `camelCase`, `use` prefix | `useScrollLock`, `useInvoiceSort` |
| Constants | `SCREAMING_SNAKE_CASE` for module-level literals | `MAX_RETRIES`, `API_BASE_URL` |
| Files | `kebab-case` for utilities, `PascalCase` for components | `format-currency.ts`, `InvoiceTable.tsx` |
| Enum-like objects | `SCREAMING_SNAKE_CASE` keys | `const STATUS = { Active: "ACTIVE" }` |

## DO

- Use full words — no abbreviations unless universally understood (`id`, `url`, `api`)
- Include the entity in the name: `userId` not `id`, `selectedInvoice` not `selected`
- Prefix booleans: `isLoading`, `hasError`, `canSubmit`, `shouldFetch`
- Name async functions clearly: `fetchUser`, `loadDashboard`, not `getData`
- Name event handlers with `handle` prefix: `handleSubmit`, `handleRowClick`

## DO NOT

- Abbreviate: `usr`, `mgr`, `btn`, `cfg`, `val`, `res`, `req`
- Use single letters except for loop indices (`i`, `j`) and type parameters (`T`, `K`)
- Name things by type: `userArray`, `stringValue`, `dataObject`
- Name things by position: `item1`, `item2`
- Use generic names: `handleStuff`, `doThing`, `myHelper`, `useData`, `processItem`

## Generics

```ts
// BAD — single letter gives no context
function first<T>(arr: T[]): T | undefined

// GOOD — descriptive when it matters
function mapById<TItem extends { id: string }>(items: TItem[]): Map<string, TItem>
```

Use single-letter generics (`T`, `K`, `V`) only when the generic is truly unconstrained and the function is simple enough that context is obvious.

## Component Props

Suffix prop type names with `Props`:

```ts
// components/InvoiceTable.tsx
interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick: (id: string) => void;
  isLoading?: boolean;
}
```

## Event Handlers

```ts
// Component props — callback names
interface ButtonProps {
  onClick: (event: MouseEvent) => void;   // external API: "on" prefix
}

// Local handlers — "handle" prefix
function handleSubmit(event: FormEvent) { ... }
function handleRowClick(id: string) { ... }
```

## See Also

- [`../philosophy/readability.md`](../philosophy/readability.md) — names express intent
- [`rules.md`](rules.md) — explicit, descriptive types
- [`../react/component-design.md`](../react/component-design.md) — `<ComponentName>Props` interfaces
