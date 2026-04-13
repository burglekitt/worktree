---
name: "fix-format-and-lint"
description: "Suggest formatting and lint fixes for PRs affecting CLI or docs. Run format/lint locally and show diffs; do not auto-commit changes."
applyTo:
  - "src/**"
  - "docs/**"
tags:
  - format
  - lint
  - review
---

Instructions:

- **Purpose:** When a PR touches source or docs files, suggest minimal formatting and lint fixes developers can apply locally. The agent must *not* auto-commit or push changes — suggest-only.

- **Checks to run (suggested commands):**
  - `pnpm format` (shows formatting issues)
  - `pnpm lint` (shows lint warnings/errors)
  - `pnpm check` (runs both format and lint checks) on worktree

- **Suggested response when issues found:**
 1. Show the failing command output and a short explanation.
 2. Provide the exact fix commands to run locally, e.g.: `pnpm check:fix`.
 3. Show a minimal `git diff --staged` style patch snippet (or the `git` diff) so maintainers can see the changes.
 4. Provide a suggested commit message, e.g.: `chore(worktree): format and fix lint in docs`.

- **Safety:** Do not apply or commit fixes automatically. If the contributor opts in, ask them to run the suggested commands and update the PR.
