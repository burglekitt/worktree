# Maintainability

## Core Rule

Write code that the next engineer (or AI agent) can understand, change, and delete safely.

## DO

- Colocate feature-specific logic with the feature
- Delete dead code rather than commenting it out
- Name things after their intent, not their implementation
- Keep functions and components focused on a single responsibility
- Make dependencies explicit (imports, props, parameters)
- Prefer flat structures over deep nesting
- Write the simplest thing that works

## DO NOT

- Leave commented-out code without a dated explanation
- Create files that "might be useful later"
- Hide behavior inside abstractions named too generically (`utils.ts`, `helpers.ts`, `common.ts`)
- Use abbreviations that require domain knowledge to decode
- Rely on implicit global state or module-level side effects
- Write clever code when obvious code works

## File Size

Large files are a signal, not a rule violation. Review for decomposition when a file:
- Exceeds ~300 lines
- Has multiple unrelated responsibilities
- Is difficult to scan or navigate

Do not split files purely to hit a line count target.

## Naming

- Name functions after what they do: `formatCurrency`, `fetchUserProfile`
- Name components after what they render: `InvoiceTable`, `UserAvatarGroup`
- Name hooks after what behavior they encapsulate: `useScrollLock`, `useDebounce`
- Avoid: `handleStuff`, `doThing`, `myHelper`, `useData`

## Colocation

```
features/
  invoices/
    InvoiceTable.tsx       ← component
    InvoiceTable.test.tsx  ← test alongside component
    useInvoiceSort.ts      ← hook used only here
    invoice.types.ts       ← types scoped to this feature
    invoice.api.ts         ← data fetching scoped to this feature
```

Move to `shared/` only when used across 3+ features.

## PRIORITY

```
Deletability > Reusability > Cleverness
```

## See Also

- [`readability.md`](readability.md) — short files, clear names, flat structure
- [`incremental-abstraction.md`](incremental-abstraction.md) — abstract late, not early
- [`../architecture/feature-driven.md`](../architecture/feature-driven.md) — colocation as a structural pattern
