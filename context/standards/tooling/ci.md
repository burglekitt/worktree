# CI and Pull Requests

## Required CI Gates

Every PR must pass these gates before merge:

- **Lint** — `pnpm lint` (Biome or ESLint)
- **Format** — `pnpm format --check` (Biome or Prettier)
- **Typecheck** — `pnpm typecheck` (`tsc --noEmit`)
- **Test** — `pnpm test` (Vitest)

E2E tests (Playwright) are recommended on critical-path branches but may be slower / less frequent.

## Example GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format --check
      - run: pnpm typecheck
      - run: pnpm test
```

For monorepos with Nx, use `nx affected` to skip unchanged projects:

```yaml
- run: pnpm nx affected --target=lint --base=origin/main
- run: pnpm nx affected --target=typecheck --base=origin/main
- run: pnpm nx affected --target=test --base=origin/main
```

## Pull Request Sizing

### DO

- Keep PRs focused on one concern — easier to review, faster to land
- Split a refactor and a feature change into separate PRs
- Open a draft PR early to make work visible

### DO NOT

- Bundle unrelated changes into one PR
- Mix renames and behavior changes in the same commit
- Wait until everything is "done" to open a PR

### When Large PRs Are Acceptable

- Mechanical changes (codemod, formatter run) — easy to review despite size
- Migrations that cannot be split safely
- Initial scaffolds

## PR Titles and Descriptions

### Title

- Imperative mood: "Add invoice export", not "Added" or "Adds"
- Under ~70 characters
- Scoped if the project uses scopes: `invoices: add CSV export`

### Description

Always include:
- **Summary** — what changed and why, 1–3 bullets
- **Test plan** — how it was verified
- **Screenshots** — for UI changes

Use [`templates/pull-request-template.md`](../templates/pull-request-template.md) as a starting point.

## Merge Strategy

**Prefer squash merges.** This keeps `main`'s history linear and readable. Each PR becomes one commit on `main`.

- The PR title becomes the commit message — write it well
- The PR description becomes the commit body
- Branch commits are preserved in the PR itself for archeology

Avoid:
- Merge commits on `main` (history becomes a tangle)
- Rebase-and-merge without squashing (every WIP commit ends up on `main`)

## Branch Hygiene

- Branch from `main` (or `develop` if your project uses it)
- Use descriptive branch names: `feature/invoice-csv-export`, `fix/login-redirect-loop`
- Delete branches after merge
- Avoid long-lived feature branches — merge early behind a flag if needed

## Worktree-Based Workflows

For AI-assisted PR workflows, use [`@burglekitt/worktree`](https://github.com/burglekitt/worktree) — a CLI utility for managing git worktree branches. Multiple agents (or a human plus an agent) can work on parallel branches in isolated worktrees without stomping on each other.

## CI for Dependency Changes

When dependencies change, CI should:
- Run a full install (no partial cache)
- Run security audit (`pnpm audit --audit-level=high`)
- Re-run all gates

## PRIORITY

```
Reviewability > Speed > Volume
Small PRs > Large PRs (unless mechanical)
```

## See Also

- [`templates/pull-request-template.md`](../templates/pull-request-template.md)
- [`architecture/refactoring.md`](../architecture/refactoring.md) — incremental refactor strategies
- [`tooling/biome.md`](biome.md) — lint and format gate
