# [Project Name]

<!-- One sentence describing what this project is and who it is for -->

## Getting Started

### Prerequisites

- Node.js v22+
- pnpm v9+

### Install and Run

```bash
pnpm install
cp .env.example .env.local
# Fill in required values in .env.local
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Development Commands

```bash
pnpm dev          # start development server
pnpm build        # production build
pnpm preview      # preview production build locally
pnpm test         # run unit and integration tests
pnpm test:e2e     # run Playwright end-to-end tests
pnpm typecheck    # TypeScript type checking
pnpm lint         # Biome linting
pnpm format       # Biome formatting
```

## Project Structure

```
src/
  features/       # feature modules (colocated components, hooks, schemas, tests)
  shared/         # reusable components, hooks, utils (used by 3+ features)
  lib/            # third-party adapters (db, auth, email)
  app/            # routing, layout, providers
```

See [CLAUDE.md](CLAUDE.md) for AI agent configuration and engineering standards.

## Tech Stack

| Area | Tool |
|---|---|
| Framework | <!-- Next.js / Remix / Vite --> |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query |
| Forms | TanStack Form / React Hook Form |
| Validation | Zod |
| Testing | Vitest + Testing Library + Playwright |
| Linting | Biome |
| ORM | <!-- Prisma / Drizzle --> |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `VITE_API_BASE_URL` | Yes | Public API base URL |

See `.env.example` for all required variables.

## Contributing

1. Branch from `main`
2. Open a draft PR early for visibility
3. Ensure `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass
4. Request review when ready
