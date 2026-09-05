# Feature-Driven Architecture

## Core Rule

Organize code by feature, not by type. A feature owns everything it needs.

## Structure

```
src/
  features/
    invoices/
      InvoiceTable.tsx        ← component
      InvoiceTable.test.tsx   ← test colocated
      InvoiceFilters.tsx
      InvoiceRow.tsx
      useInvoiceSort.ts       ← hook used only in this feature
      invoice.schema.ts       ← Zod schemas for this feature
      invoice.api.ts          ← data fetching for this feature
      invoice.types.ts        ← types not derivable from schema
    users/
      UserProfile.tsx
      useCurrentUser.ts
      user.schema.ts
  shared/
    components/               ← reused across 3+ features
    hooks/
    schemas/
    utils/
  app/                        ← routing, layout, providers
```

## What Goes in a Feature

A feature folder contains everything the feature needs that is not shared with other features:

- Components (primary + sub-components)
- Hooks specific to this feature
- API functions
- Zod schemas and inferred types
- Tests
- Constants used only here

## What Belongs in `shared/`

Move to `shared/` only when:
- Used by 3 or more distinct features
- The shared nature is expected to be permanent, not incidental

Never move something to `shared/` preemptively.

## DO NOT

- Organize by type at the root level (`components/`, `hooks/`, `types/`) for a large app
- Import from another feature's internals directly
- Create a `utils/` catch-all that accumulates unrelated helpers over time

## Feature Communication

Features must not import from each other's internals. If two features share a concept:

1. Move the shared concept to `shared/`
2. Both features import from `shared/`

```
features/
  invoices/
    invoice.schema.ts   ← imports User from shared/schemas/user.schema.ts
  users/
    user.schema.ts      ← defined here, re-exported from shared/
shared/
  schemas/
    user.schema.ts      ← canonical location for shared User schema
```

## Scaling

As the app grows, features can be grouped by domain:

```
features/
  billing/
    invoices/
    payments/
    subscriptions/
  crm/
    contacts/
    companies/
```

## PRIORITY

```
Feature isolation > Shared reuse > Organizational elegance
```

## See Also

- [`shared-code.md`](shared-code.md) — what belongs in `shared/`
- [`folder-structure.md`](folder-structure.md) — canonical folder maps
- [`dependency-boundaries.md`](dependency-boundaries.md) — feature isolation rules
- [`../philosophy/maintainability.md`](../philosophy/maintainability.md) — colocation principle
