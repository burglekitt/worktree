---
name: core
description: >
  Complete usage guide for @burglekitt/worktree. Covers install, first-time
  setup with worktree config (defaultSourceBranch, codeEditor, github.token,
  jira.host, jira.email, jira.apiToken, branchPrefix.feature,
  branchPrefix.bugfix, branchPrefix.chore), worktree branch, worktree checkout,
  worktree list, worktree open, worktree remove (alias: rm), worktree cleanup,
  --github issue-to-branch, --jira issue-to-branch, and automatic .env /
  .env.local copying into new worktrees.
type: core
library: '@burglekitt/worktree'
library_version: "1.2.2"
sources:
  - "burglekitt/worktree:README.md"
  - "burglekitt/worktree:docs/src/app/docs/commands/branch/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/checkout/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/cleanup/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/config/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/list/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/open/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/commands/remove/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/configuration/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/guides/github-issue-integration/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/guides/jira-integration/page.mdx"
  - "burglekitt/worktree:docs/src/app/docs/guides/env-files/page.mdx"
  - "burglekitt/worktree:src/commands/branch.ts"
  - "burglekitt/worktree:src/lib/git.ts"
  - "burglekitt/worktree:src/lib/validators.ts"
---

# @burglekitt/worktree

CLI wrapper for `git worktree` that turns the common branch-create,
env-copy, editor-open, and cleanup cycle into single commands. Config
is stored in local git config under `burglekitt.worktree.*`. Worktrees
are created in a sibling directory named `<repo>.worktrees/`.

## Setup

```bash
npm install -g @burglekitt/worktree

# Run once inside your git repository
worktree config
# prompts for: defaultSourceBranch (e.g. origin/main), codeEditor (e.g. code)

# Create your first worktree
worktree branch feature/my-feature
```

## Core Patterns

### Create a new branch in its own worktree

```bash
# Branch from configured defaultSourceBranch
worktree branch feature/add-bulk-actions

# Branch from a specific remote branch
worktree branch feature/add-bulk-actions --source origin/release/1.4
```

Creates a branch, adds a worktree under `<repo>.worktrees/feature/add-bulk-actions`,
copies `.env` and `.env.local` from the root worktree, and opens the directory
in the configured `codeEditor`.

### Check out an existing remote branch as a worktree

```bash
# Short form — origin/ prefix added automatically
worktree checkout feature/fix-login-timeout

# Full remote path also accepted
worktree checkout origin/feature/fix-login-timeout
```

Use `checkout` only for branches that already exist on the remote.
Use `branch` to create something new.

### Derive a branch name from a GitHub or Jira issue

```bash
# GitHub — requires github.token in config (or gh CLI authenticated)
worktree branch --github 42
worktree branch --github "#42"

# Jira — requires jira.host, jira.email, jira.apiToken in config
worktree branch --jira DEV-123
worktree branch --jira dev-123
```

The generated branch name is pre-filled in an interactive prompt and
editable before confirmation. Branch prefixes are applied when configured:
- `Feature` / `Story` → `branchPrefix.feature`
- `Bug` → `branchPrefix.bugfix`
- `Task` → `branchPrefix.chore`

### Maintain the worktree lifecycle

```bash
# See all active worktrees
worktree list

# Reopen a worktree in your editor
worktree open feature/add-bulk-actions

# Remove a specific worktree
worktree remove feature/add-bulk-actions
worktree rm feature/add-bulk-actions          # alias
worktree remove feature/add-bulk-actions --force  # skip confirmation

# Remove all stale worktrees (no unpushed work, remote gone, etc.)
worktree cleanup
worktree cleanup --force                      # skip confirmation
```

## Configuration Reference

All keys are stored via `worktree config <key> <value>` in git config
under `burglekitt.worktree.*`.

| Key | Example value | Required for |
|---|---|---|
| `defaultSourceBranch` | `origin/main` | `worktree branch` without `--source` |
| `codeEditor` | `code` | auto-opening worktrees |
| `github.token` | `ghp_...` | `--github` flag |
| `jira.host` | `https://company.atlassian.net` | `--jira` flag |
| `jira.email` | `you@company.com` | `--jira` flag |
| `jira.apiToken` | `ATATT...` | `--jira` flag |
| `branchPrefix.feature` | `feature/` | auto-prefix on Feature issues |
| `branchPrefix.bugfix` | `fix/` | auto-prefix on Bug issues |
| `branchPrefix.chore` | `chore/` | auto-prefix on Task issues |

```bash
# Configure only missing keys
worktree config --missing

# Configure specific keys
worktree config --missing --names jira.host,jira.email,jira.apiToken

# Non-interactive (answer yes to all confirmations)
worktree config --yes --missing --names branchPrefix.feature,branchPrefix.bugfix

# List all current values
worktree config --list
```

## Common Mistakes

### CRITICAL `worktree checkout` used to create a new branch

Wrong:

```bash
worktree checkout feature/my-brand-new-feature
```

Correct:

```bash
worktree branch feature/my-brand-new-feature
```

`checkout` only creates a worktree from an existing remote branch.
Running it with a branch name that doesn't exist on the remote will fail.

Source: `docs/commands/branch`, `docs/commands/checkout`

---

### HIGH Running commands outside a git repository

Wrong:

```bash
# In /tmp or a non-git directory
worktree branch feature/x
```

Correct:

```bash
cd /path/to/your/git/repo
worktree branch feature/x
```

`gitGetRootPath()` throws `"Unable find the root path. Are you in a git repository?"` when no git repo is found in the current directory or any parent.

Source: `src/lib/git.ts` — `gitGetRootPath()`

---

### HIGH Skipping `worktree config` before first use

Wrong:

```bash
npm install -g @burglekitt/worktree
worktree branch feature/x
```

Correct:

```bash
npm install -g @burglekitt/worktree
worktree config          # run once per repo
worktree branch feature/x
```

Without `defaultSourceBranch` set, `branch` prompts interactively for a
source branch, blocking non-interactive runs. Without `codeEditor`, the
worktree is created but not opened.

Source: `README.md` quick start, `docs/getting-started`

---

### HIGH `--jira` flag used with incomplete Jira config

Wrong:

```bash
worktree config jira.host https://company.atlassian.net
worktree branch --jira DEV-123
```

Correct:

```bash
worktree config jira.host https://company.atlassian.net
worktree config jira.email your@company.com
worktree config jira.apiToken ATATT3xFfGF...
worktree branch --jira DEV-123
```

All three Jira keys are required. Missing any one causes an authentication
error when the CLI calls the Jira API.

Source: `docs/guides/jira-integration`, `src/integrations/jira.ts`

---

### MEDIUM `--source` flag given without `origin/` prefix

Wrong:

```bash
worktree branch feature/x --source main
```

Correct:

```bash
worktree branch feature/x --source origin/main
```

A `--source` value without the `origin/` prefix triggers a `confirm()`
interactive prompt asking whether to use a local branch. This hangs
non-interactive agent runs.

Source: `src/commands/branch.ts` — `confirmNonOriginSource()`

---

### MEDIUM Branch prefix configured without trailing slash

Wrong:

```bash
worktree config branchPrefix.feature feature
```

Correct:

```bash
worktree config branchPrefix.feature feature/
```

The prefix is concatenated directly with the branch slug. Without a
trailing slash, issue-derived names run together: `featuremy-thing`
instead of `feature/my-thing`.

Source: `docs/configuration`, `docs/guides/github-issue-integration`

---

### HIGH Tension: interactive prompts block scripted use

The CLI is designed for interactive human use — confirm prompts, branch
pickers, and spinners are the default UX. In agent or scripted contexts,
these prompts cause hangs.

Always provide explicit values when running non-interactively:

```bash
# Instead of relying on interactive pickers:
worktree branch feature/x --source origin/main
worktree remove feature/x --force
worktree cleanup --force
```

Source: `src/commands/branch.ts`, `src/commands/cleanup.ts`, `src/commands/remove.ts`
