# Monorepos

## Preferred Tooling

- **Nx** — build system, task orchestration, generators, affected commands
- **pnpm** — package manager (workspaces, efficient storage, strict linking)

## When to Use a Monorepo

Use a monorepo when:
- A frontend and backend share types or schemas
- Multiple apps share a component library
- A team maintains more than one deployable unit with significant shared code

Do not add monorepo tooling to a single-app project speculatively.

## Workspace Structure

```
apps/
  web/              ← Next.js / Remix frontend
  api/              ← Express / Hono / tRPC backend
packages/
  ui/               ← shared component library
  schemas/          ← shared Zod schemas (FE + BE)
  tsconfig/         ← shared tsconfig presets
  eslint-config/    ← shared ESLint config
  biome-config/     ← shared Biome config
```

Group packages by domain when scaling:

```
packages/
  frontend/
    ui/
    design-tokens/
  backend/
    database/
    email/
  shared/
    schemas/
    utils/
```

## Nx Setup

```bash
pnpm dlx create-nx-workspace@latest acme --preset=ts
```

Key Nx commands:

```bash
nx build web                    # build a specific project
nx test api                     # test a specific project
nx affected --target=build      # build only changed projects
nx graph                        # visualize dependency graph
nx generate @nx/react:component # generate a component
```

## pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

Use workspace protocol for internal dependencies:

```json
{
  "dependencies": {
    "@acme/schemas": "workspace:*",
    "@acme/ui": "workspace:*"
  }
}
```

## Dependency Rules

- Apps may depend on packages
- Packages must not depend on apps
- Packages should not depend on other packages unless the dependency is stable and intentional
- Use `nx graph` to audit the dependency graph
- Circular dependencies are forbidden

## DO NOT

- Create publishable packages unless explicitly required for external consumption
- Add unnecessary inter-package dependencies
- Bypass the monorepo's package boundaries with relative imports across app/package boundaries
- Use `npm` or `yarn` in a pnpm workspace

## PRIORITY

```
Feature isolation > Build efficiency > Package granularity
```

## See Also

- [`../tooling/nx.md`](../tooling/nx.md) — Nx commands and configuration
- [`dependency-boundaries.md`](dependency-boundaries.md) — cross-package rules
- [`../tooling/ci.md`](../tooling/ci.md) — `nx affected` in CI
