# Dependency Boundaries

## Core Rule

Features must not depend on each other. Features depend on `shared/`. `shared/` depends on nothing internal.

## Allowed Dependencies

```
apps/web       → packages/ui, packages/schemas
apps/api       → packages/schemas
features/X     → shared/
features/X     → lib/
shared/        → lib/
lib/           → external packages only
packages/*     → external packages only (no internal app code)
```

## Forbidden Dependencies

```
features/invoices  → features/users      ✗ cross-feature import
packages/ui        → apps/web            ✗ package depends on app
shared/            → features/           ✗ shared depends on feature
```

## In Practice

If feature A needs something from feature B:

**Option 1: Move it to `shared/`**
- Move the shared concept to `shared/`
- Both features import from `shared/`

**Option 2: Pass it as a prop or callback**
- Feature A receives the data it needs via props
- Feature B provides the data at the composition layer (page, layout)

**Option 3: Use a shared store or context**
- If it is runtime state (current user, theme), put it in context or Zustand
- Both features read from the same source

## Detecting Violations

In a monorepo, use Nx's enforcement:

```json
// nx.json
{
  "targetDefaults": {
    "lint": {
      "configurations": {
        "enforce-boundaries": true
      }
    }
  }
}
```

In a single app, use ESLint's `import/no-restricted-paths`:

```js
// eslint.config.js
{
  rules: {
    "import/no-restricted-paths": ["error", {
      zones: [
        {
          target: "./src/features",
          from: "./src/features",
          except: ["./src/features/invoices"], // each feature only allows itself
        },
      ],
    }],
  }
}
```

## Circular Dependencies

Circular dependencies are always forbidden. They indicate a design problem.

Common causes:
- `shared/` importing from a feature
- Two features that should be combined into one
- Missing abstraction that should be in `shared/`

Use `madge` to detect cycles:

```bash
pnpm dlx madge --circular src/
```

## PRIORITY

```
Isolation > Convenience > DRY
```

## See Also

- [`feature-driven.md`](feature-driven.md) — feature ownership
- [`shared-code.md`](shared-code.md) — what belongs in `shared/`
- [`monorepos.md`](monorepos.md) — package-level boundaries
