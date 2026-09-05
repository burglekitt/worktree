# Folder Structure

## React App (Single Repo)

```
src/
  app/                      ← routing, layout, root providers
    layout.tsx
    providers.tsx
    router.tsx
  features/                 ← feature-driven modules
    invoices/
      InvoiceTable.tsx
      InvoiceTable.test.tsx
      useInvoiceSort.ts
      invoice.schema.ts
      invoice.api.ts
    users/
      UserProfile.tsx
      user.schema.ts
  shared/                   ← reused across 3+ features
    components/
      Button.tsx
      Modal.tsx
    hooks/
      useDebounce.ts
    schemas/
      pagination.schema.ts
    utils/
      format-currency.ts
  lib/                      ← third-party adapter layer
    db.ts
    auth.ts
    stripe.ts
  styles/
    globals.css
  main.tsx
```

## Next.js App (App Router)

```
app/                        ← Next.js App Router
  (auth)/
    login/
      page.tsx
  (dashboard)/
    invoices/
      page.tsx
      [id]/
        page.tsx
  layout.tsx
  providers.tsx
src/                        ← application code (same as above)
  features/
  shared/
  lib/
public/
```

## Monorepo

```
apps/
  web/                      ← frontend app
    src/
      features/
      shared/
      lib/
  api/                      ← backend app
    src/
      routes/
      services/
      lib/
packages/
  ui/                       ← shared component library
  schemas/                  ← shared Zod schemas
  tsconfig/
  eslint-config/
  biome-config/
nx.json
pnpm-workspace.yaml
```

## Rules

- Feature folders are flat by default — add sub-folders only when a feature grows large
- `shared/` files are named by purpose, not by type: `format-currency.ts` not `string-utils.ts`
- `lib/` contains only external service adapters — no business logic
- Tests live next to the code they test, not in a separate `__tests__/` directory
- Use `index.ts` barrel exports sparingly — only at feature boundaries, not inside features

## File Naming

| Type | Convention | Example |
|---|---|---|
| React components | `PascalCase.tsx` | `InvoiceTable.tsx` |
| Hooks | `camelCase.ts` | `useInvoiceSort.ts` |
| Schemas | `kebab-case.schema.ts` | `invoice.schema.ts` |
| API functions | `kebab-case.api.ts` | `invoice.api.ts` |
| Utilities | `kebab-case.ts` | `format-currency.ts` |
| Tests | same name + `.test.ts(x)` | `InvoiceTable.test.tsx` |

## See Also

- [`feature-driven.md`](feature-driven.md) — feature folder anatomy
- [`shared-code.md`](shared-code.md) — `shared/` vs `lib/`
- [`dependency-boundaries.md`](dependency-boundaries.md) — import rules between layers
