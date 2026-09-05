# The planning workflow

Three tiers. Every boundary between them is crossed by an **explicit command, never as a side-effect** of
running something else.

```
/roadmap "idea"  ──▶  pending                    Tier 1 — the backlog
                        │                        context/roadmap.md, with notes in context/drafts/
                  /feature-plan [--activate]     writes context/plans/<NAME>-PLAN.md, then STOPS
                        ▼
                  a plan exists                  Tier 2 — one plan, with a phase status ledger
                        │
                  /feature-implement             activates, then runs phases: plan → code → verify → review
                        ▼
                  /feature-close                 ──▶ context/archive/ + a context/history.md row
```

| Transition | Command |
|---|---|
| Tier 1 → a plan | `/feature-plan` |
| a plan → being worked, then phase by phase | `/feature-implement` |
| Tier 2 → retired | `/feature-close` |
| no tier crossed | `/orchestrate` — one ad-hoc gated change; `/feature-status` — read-only |

**Every command finds its own starting point.** Nothing has to be looked up first, and `/feature-status` is
never a prerequisite for anything.

## The commands

| Command | Owns | Writes |
|---|---|---|
| `/roadmap` | Tier 1 contents | `roadmap.md`, and `drafts/` when material is supplied |
| `/feature-plan` | Tier 1 → a plan document | `plans/<NAME>-PLAN.md`; the `active` marker only with `--activate` |
| `/feature-implement` | activation, and the phases within a plan | the plan's ledger, `findings.md`, the code |
| `/feature-status` | nothing — read-only | — |
| `/feature-close` | Tier 2 → retired | `history.md`, `archive/`, the reference sweep |
| `/orchestrate` | one ad-hoc gated change | the code, and `findings.md` |
| `/onboard` | the project-owned stubs | `verify.md`, `executors.md`, `stack.md`, and the pruning of what they replace |

## One source of truth per fact

| To know | Read |
|---|---|
| whether a feature is being worked | the `pending` / `active` marker in its `roadmap.md` heading |
| whether a feature has a plan | whether its **Doc** field points into `plans/` |
| where a phase stands | that plan's own status ledger |
| what a retired feature's outcome was | its `history.md` row |

**"Planned" is not a status.** It is the observation that a document exists in `plans/`. The marker answers
*is it being worked*; the **Doc** path answers *does it have a plan*. The two are orthogonal, so neither can
go stale against the other.

| Marker | **Doc** points at | Means |
|---|---|---|
| `pending` | nothing, or `drafts/` | an idea |
| `pending` | `plans/` | planned, not being worked |
| `active` | `plans/` | being worked |

**The two status vocabularies stay distinct.** The word alone tells you which tier you are looking at:

| Tier | Lives in | Values |
|---|---|---|
| Feature | `roadmap.md`, in the entry heading | `pending`, `active` |
| Phase | the plan's ledger, Status column | `not started`, `in progress`, `blocked`, `done` |

They are not synonyms. Spell them exactly as written — `not started` is two words, never `not-started`.

## The standing rules

Every command below cites these rather than restating them. Two independently-worded copies of one rule is
the drift this design exists to prevent.

### One active feature

> **At most one roadmap entry is `active`. Any command that sets the marker checks this first.**

`/feature-plan --activate` and `/feature-implement` both check it. Planning is *not* activation — several
features may hold plans at once, and that is what makes planning ahead possible.

### Feature or task?

> **If you would want a `history.md` row for it, it is a feature — use the roadmap flow.
> If you would not, it is a task — use `/orchestrate`.**

`/orchestrate` is the ad-hoc escape hatch, not the way to skip planning. It refuses anything larger than a
commit-sized unit and anything an existing roadmap entry already covers.

### Never transcribe a credential

> **A DSN, token or key is described and pointed at the secret store, never copied into a tracked file.**

Write `$SENTRY_DSN`-style placeholders and name where the real value lives. The sharp cases are `/roadmap`
capturing supplied material, `/feature-plan` carrying a draft's specifics forward, and `/onboard`, which
collects shell commands.

### The ledger is read fresh, every time

Nothing is cached, parsed by a script, or generated. Hand-editing a ledger row changes the answer
immediately, with no regeneration step. `check` validates shape and answers no workflow question — delete
it and every answer here is unchanged.

### Commands live in one file

`verify.md` is the only file in this project that names a verification command — not a skill, not an agent
prompt, not a role file. A hardcoded stack rots the moment the project changes shape, and a second copy
rots faster.

## Phase status

Inside a plan, phase status lives in that document's status ledger **and nowhere else**. Not in a separate
file, not in a TODO list, not in a commit message.

To pick the next phase: take the **lowest-numbered phase that is not `done` and whose `Depends on` entries
are all `done`.** State which one you picked before starting. If it is already `in progress`, read its Note
and resume — do not restart it.

`done` means committed and verified, and whoever finishes a phase updates its row in the same commit.

If the ledger's claim disagrees with the repo — a phase marked `done` whose files do not exist, or the
reverse — **stop and say so.** Never silently re-do or skip a phase on a stale ledger.

## The gates

Any command that lands code runs two gates, in order.

**Gate 1 — verification.** Read [`verify.md`](verify.md) and run its sections in order: Lint → Typecheck →
Build → Test. Never carry a copy of those commands and never invent one. A missing section is skipped, never
faked. Exit 0 is the verdict regardless of what any summary text claims. If `verify.md` does not exist, stop
and say so.

**Gate 2 — review.** Dispatch per [`executors.md`](executors.md). Every verdict needs concrete evidence —
file paths, command output — and every blocking finding needs a `P0`–`P3` severity. A `FAIL` is written to
[`findings.md`](findings.md) **first**, then looped back. Cap: two loops, then write a finding and escalate.
Escalating is not a substitute for recording: the conversation ends, the file does not.

## Findings

[`findings.md`](findings.md) holds defects that outlive the session that found them. **An open `P0` or `P1`
tied to a phase blocks that phase from being marked `done`**, and blocks `/feature-close` on its feature.

A finding closes when the gate that raised it re-passes, citing that run. There is no "fixed but unverified"
state. Closed findings leave the file entirely — at `/feature-close` for a feature's findings, and at the
start of the next `/orchestrate` for ad-hoc ones. That file must not grow for the life of the project.
