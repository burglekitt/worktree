# AGENTS — Worktree repository

Purpose: document recommended agent workflows, repository layout, and examples for creating workspace-level agents, prompts, and skills that match this monorepo's patterns.

## Repository overview

- Root package (`@burglekitt/worktree`)
  - Type: Node CLI (ESM) built with TypeScript and [`oclif`](https://oclif.io/docs/api_reference).
  - Entry: `bin/run.js` (produced from `tsc`), commands live in `src/commands`.
  - Libraries/helpers: `src/lib` (CLI helpers, git integration, validators, utils).
  - Scripts: build/test/format via `pnpm` and `biome`/`vitest` (see `package.json`).

- Workspace Docs site (`docs/`)
  - [Next.js](https://nextjs.org/docs) / [Nextra](https://nextra.site/docs) -based docs app, React 19.
  - Uses [`pnpm`](https://pnpm.io/workspaces) workspace and has its own `package.json` in `docs/`.
  - Uses [Base UI](https://base-ui.com/react/overview/quick-start) for UI library
  - UI and examples live under `docs/src`, docs content under `docs/src/app`.

Separation of concerns

- The CLI code (root `src/`) is server-side Node code (sticks to ESM, interacts with the terminal, uses `@oclif/core`).

- The docs app is a static/SSR Next app and must never contain secrets or server-side API keys in client-side code.

## Conventions & Tooling

- Language: TypeScript (tsconfig at repo root)
- Module type: ESM (`type: module` in root `package.json`)
- Formatting: [`biome`](https://biomejs.dev/guides/getting-started/) (scripts in package.json)
- Testing: [`vitest`](https://vitest.dev/guide/) (unit tests under `src` and `docs/src`)
- Monorepo: [`pnpm`](https://pnpm.io/workspaces) workspace, use `pnpm` commands for cross-package scripts (e.g., `pnpm --filter docs dev`)
- Avoid `export default` unless it is required

## Where to put agent/customization files

- Workspace-level agents: place in the repository root as `AGENTS.md` (like this file) or under `.github/agents/` if you want them grouped with CI config.
- Prompts & instructions: `.github/prompts/` and `.github/instructions/` are good places for repeatable prompt files, but keeping short examples next to the relevant code is OK (e.g., `docs/.agents/` or `docs/AGENTS.md`).

Follow the `agent-customization` SKILL guidelines: include a clear `description`, `applyTo` globs for scope, and keep YAML frontmatter well-formed.

## Recommended agents (examples)

1) Review PRs and apply requested fixes

Purpose: assist reviewers and apply trivial fixes (formatting, lint suggestions, small code tweaks) in PRs that target the CLI or docs.

When to run: on PR review, or locally via a prompt.

ApplyTo examples:
```
applyTo:
  - "src/**"
  - "docs/src/**"
```

Suggested prompt (agent):
```
name: review-and-suggest-fixes
description: "Review changed files and suggest or apply small fixes: formatting, lint warnings, test errors. Use 'applyTo' to scope to CLI or docs files."
```

Notes: avoid making large behavioral changes without human approval; provide a summary of all modifications and a commit message suggestion.


2) CLI maintenance helper

Purpose: help generate new `oclif` commands, run `pnpm build`, and ensure `bin/` scripts are executable.

ApplyTo:
```
applyTo:
  - "src/commands/**"
  - "bin/**"
```

Suggested prompt: "Create a new CLI command file consistent with existing patterns: use `BaseCommand`, export default class, use flags/args pattern, and add tests under `src/commands/*.test.ts`." 

## Example agent file frontmatter (YAML)

Use simple [YAML frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) for on-disk agent definitions. Example:

```
---
name: "fix-format-and-lint"
description: "Run format/lint fixes on modified files and return a short commit message. Use when PR contains lint or format errors."
applyTo:
  - "src/**"
  - "docs/**"
---

Instructions:
- Run `pnpm format:fix` and `pnpm lint:fix` locally.
- Show the before/after diff and suggested commit message.
```

## Developer commands (quick reference)

- Install deps: `pnpm install`
- Run docs locally: `pnpm --filter docs dev`
- Run full test suite: `pnpm test` (runs root and filtered tests)
- Build CLI: `pnpm build`
- Format: `pnpm format`

## Security notes for agents

- Never embed secrets or API keys in prompt/instruction files. If an agent needs to interact with external systems that require secrets, document where to set them (CI secrets, serverless platform env vars) and keep those values out of the repo.


## How to add a new agent

1. Decide scope (`applyTo` patterns) and place the file under `.github/agents/` or add a short entry in `AGENTS.md`.
2. Include a `description` with trigger keywords (so discovery works reliably).
3. Validate YAML frontmatter and that any example commands are correct for this repo (use `pnpm` scripts where appropriate).
4. Ask reviewers to verify the agent on a representative PR.

## Further Reference

1

## Contact / Maintainers

For agent reviews and maintenance, ask the repository maintainers listed in `package.json` (`contributors`) or open a PR with suggested agent files.

---
Generated by repository scan — adapt as needed for team preferences.

