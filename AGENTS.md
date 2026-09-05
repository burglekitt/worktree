# AGENTS — Worktree repository

`@northguild/worktree` — a Node CLI for managing git worktrees, built on oclif, with a Next.js/Nextra
documentation site under `docs/`. Both live in one pnpm workspace.

Layout, runtime and the conventions specific to this repository are in
[`context/stack.md`](context/stack.md).

## Contact / Maintainers

For agent reviews and maintenance, ask the repository maintainers listed in `package.json`
(`contributors`) or open a PR with suggested agent files.

<!-- ai-workflow:start -->
## Planning workflow

Planning artifacts live in [`context/`](context/README.md). Read
[`context/workflow.md`](context/workflow.md) before using any command below — it holds the tier model and
the standing rules, and every command cites it rather than restating it.

| Command | Does |
|---|---|
| `/roadmap` | prints the Tier-1 backlog, or appends one `pending` entry to it |
| `/feature-plan` | turns a backlog entry into `context/plans/<NAME>-PLAN.md` and **stops** — it never implements |
| `/feature-implement` | activates a planned feature and runs its phases, through both gates |
| `/feature-status` | read-only "where do things stand". **Never a prerequisite** for anything |
| `/feature-close` | retires a finished or abandoned feature into `context/archive/` |
| `/orchestrate` | one ad-hoc, gated, commit-sized change — no roadmap entry, no ledger |
| `/onboard` | fills in this project's own stubs — `verify.md`, `executors.md`, `stack.md` — adopting what an existing `AGENTS.md` already said |

| Read | For |
|---|---|
| [`context/stack.md`](context/stack.md) | runtime, layout, conventions |
| [`context/standards/README.md`](context/standards/README.md) | engineering standards — load per its conditional table |
| [`context/verify.md`](context/verify.md) | the real lint / typecheck / build / test commands — the only file that names one |

**Phase status lives in the active plan's status ledger and nowhere else.** Work the lowest-numbered phase
that is not `done` and whose `Depends on` are all `done`; state which you picked before starting; update
the row in the same commit as the work. **If the ledger disagrees with the repo, stop and say so.**

**An open `P0` or `P1` in [`context/findings.md`](context/findings.md) blocks its phase from being `done`.**

**Require evidence, not assertion.** A claim about what a file contains needs the file read, not recalled —
yours as much as a subagent's.
<!-- ai-workflow:end -->
