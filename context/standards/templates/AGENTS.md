# AGENTS.md

This project follows the [AI Engineering Standards](https://github.com/baldurpan/ai-engineering-standards).

Load that repo's [`README.md`](https://github.com/baldurpan/ai-engineering-standards/blob/main/README.md) and follow its conditional-loading guidance based on the task at hand.

---

## Project

<!-- One sentence: what this project is and who it is for. -->

## Stack

<!-- Adjust to match this project. -->

- Language: TypeScript (strict)
- Framework: <!-- Next.js / Remix / Vite -->
- Styling: Tailwind CSS + shadcn/ui
- Data fetching: TanStack Query
- Forms: TanStack Form / React Hook Form + Zod
- Testing: Vitest + Testing Library + Playwright

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm test         # unit + integration tests
pnpm test:e2e     # Playwright E2E tests
pnpm typecheck    # TypeScript type check
pnpm lint         # Biome lint
pnpm format       # Biome format
```

## Key Directories

| Path | Purpose |
|---|---|
| `src/features/` | Feature-driven modules — colocate components, hooks, schemas, tests |
| `src/shared/` | Reusable code used across 3+ features |
| `src/lib/` | Third-party adapters (db, auth, email) |

## Project-Specific Rules

<!-- Optional: any additions or overrides to the standards. Keep these focused on this project. -->
