# Shared Code

## Core Rule

Code is shared when it is genuinely reused across multiple features — not when it might be reused someday.

## The Three-Feature Rule

Do not move code to `shared/` until it is used by at least three distinct features. Two uses may be coincidence. Three is a pattern.

## `shared/` Structure

```
shared/
  components/       ← UI components reused across 3+ features
    Button.tsx
    Modal.tsx
    DataTable.tsx
  hooks/            ← hooks reused across 3+ features
    useDebounce.ts
    useMediaQuery.ts
  schemas/          ← Zod schemas shared between frontend and backend
    user.schema.ts
    pagination.schema.ts
  utils/            ← pure utility functions
    format-currency.ts
    parse-date.ts
  types/            ← shared TypeScript types not derivable from schemas
    pagination.types.ts
```

## Naming Rules for `shared/`

Name shared things after what they do, not what they are:

```
shared/utils/format-currency.ts    ← clear purpose
shared/utils/helpers.ts            ← meaningless catch-all (avoid)
shared/utils/utils.ts              ← avoid
shared/utils/common.ts             ← avoid
```

## DO NOT

- Create `shared/` as a dumping ground — every file must have a reason to be there
- Put feature-specific logic in `shared/` because it seems "useful"
- Create a single `index.ts` barrel export that re-exports everything in `shared/` — it makes tree-shaking worse and creates implicit coupling
- Put application state, context providers, or business logic in `shared/`

## `lib/` vs `shared/`

Some projects use `lib/` for third-party integrations and adapter code:

```
lib/
  db.ts             ← Prisma client singleton
  auth.ts           ← Auth.js / Clerk adapter
  email.ts          ← email provider adapter
  stripe.ts         ← Stripe adapter
```

`lib/` wraps external services. `shared/` contains internal reusable code.

## When Code Outgrows `shared/`

In a large app or monorepo, promote heavily-used `shared/` code to a dedicated package:

```
packages/
  ui/               ← shared component library
  schemas/          ← shared Zod schemas
  utils/            ← shared utility functions
```

Do not create packages prematurely. Start in `shared/`, promote when the boundary is clear.

## See Also

- [`feature-driven.md`](feature-driven.md) — feature ownership
- [`dependency-boundaries.md`](dependency-boundaries.md) — allowed imports
- [`../philosophy/incremental-abstraction.md`](../philosophy/incremental-abstraction.md) — three-instance rule
