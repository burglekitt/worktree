# Nx

## Purpose

Nx is the build system and task orchestrator for monorepos. It provides:

- Affected command computation (only build/test what changed)
- Local and remote caching
- Generators for scaffolding
- Dependency graph visualization

## Key Commands

```bash
# Run a target for a specific project
nx build web
nx test api
nx lint ui

# Run a target for all projects
nx run-many --target=build
nx run-many --target=test --parallel=3

# Only run for affected projects (CI-optimized)
nx affected --target=build --base=main
nx affected --target=test --base=main

# Visualize the dependency graph
nx graph

# Generate code
nx generate @nx/react:component InvoiceTable --project=web
nx generate @nx/node:library schemas --directory=packages/schemas
```

## Project Configuration

Each project has a `project.json`:

```json
{
  "name": "web",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "options": { "outputPath": "dist/apps/web" }
    },
    "dev": {
      "executor": "@nx/vite:dev-server",
      "options": { "buildTarget": "web:build" }
    },
    "test": {
      "executor": "@nx/vite:test"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "typecheck": {
      "executor": "nx:run-commands",
      "options": { "command": "tsc --noEmit" }
    }
  }
}
```

## Caching

Nx caches task outputs by default. CI should use Nx Cloud or remote cache:

```bash
# nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "typecheck"]
      }
    }
  }
}
```

## Enforcing Boundaries

```json
// nx.json
{
  "targetDefaults": {},
  "namedInputs": {},
  "generators": {
    "@nx/react": {
      "library": { "bundler": "vite" }
    }
  }
}
```

Use `@nx/eslint-plugin` with `enforce-module-boundaries` to prevent cross-boundary imports.

## DO NOT

- Skip `nx affected` in CI — it is the primary value proposition of Nx
- Manually run all tests when only one project changed
- Create circular dependencies between projects
- Publish packages unless explicitly required for external consumption

## See Also

- [`../architecture/monorepos.md`](../architecture/monorepos.md) — when and how to use a monorepo
- [`../architecture/dependency-boundaries.md`](../architecture/dependency-boundaries.md) — enforcing imports
- [`ci.md`](ci.md) — `nx affected` in CI
