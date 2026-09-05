---
name: feature-implement
description: "Activate a planned feature in context/roadmap.md and run the next phase of its plan through implementation, verification and review, updating that plan's status ledger. Explicit invocation only — run this when the user types /feature-implement. Do NOT match on 'implement X', 'build this', 'let's code it', or any general request to write code."
---

# /feature-implement

Owns the transition from *has a plan* to *being worked*, **and** the phases within it. One invocation runs
**one phase**: pick it, do it, gate it, close out its ledger row.

Read [`context/workflow.md`](../../../context/workflow.md) for the tier model, the one-active-feature rule
and the gate contract. This skill cites those rather than restating them.

## Usage

```
/feature-implement            # resolve or choose a feature, then run the next phase
/feature-implement "<name>"   # a named feature
```

## 1. Resolve the feature

Read `context/roadmap.md`.

- **One entry is `active`** → that is the feature. Skip to step 3.
- **None active** → rank the entries whose **Doc** points into `context/plans/` and **ask which to
  activate**, using your runtime's question mechanism if it has one. Rank by: open questions resolved →
  dependencies shipped (a `history.md` row under it) → smaller first.
- **No entry has a plan** → say so and name `/feature-plan`. Do not plan one here.
- **A name was given** → resolve it against `roadmap.md`. It must have a plan; if it does not, name
  `/feature-plan`.

**Never execute anything out of `context/drafts/`.** A draft has no ledger and is not a plan, however
detailed it looks.

## 2. The approval checkpoint — before setting the marker

This is the step that used to be structural: `/feature-plan` stopped and you typed a second command. It is
explicit here now, or it is lost.

1. **Surface the plan's §8 Open questions and require an acknowledgement.** Do not proceed on silence.
2. **Re-check that the files the plan cites still exist.** A plan drafted a month ago against a
   since-changed tree is a state that can now exist and could not before. Name anything that has moved.
3. **Check the one-active-feature rule** in [`context/workflow.md`](../../../context/workflow.md). If
   another entry holds the slot, stop and name it.
4. Set the marker to `active`. One token, one place — do not move the entry, add a section, or write a
   summary line anywhere.

## 3. Pick the phase

Read the plan's status ledger. Take the **lowest-numbered phase that is not `done` and whose `Depends on`
entries are all `done`.**

**State which phase you picked, and why, in one line, before doing anything else.**

If it is already `in progress`, **read its Note and resume from there — do not restart it.**

## 4. Check `context/findings.md`

An open `P0` or `P1` tied to this phase **is** the work. Fix it before starting anything new.

## 5. Stop on disagreement

If the ledger's claim contradicts the repo — a phase marked `done` whose **Files:** do not exist, or work
plainly in the tree under a phase marked `not started` — **say so and stop.** Never silently re-do or skip
a phase on a stale ledger.

## 6. Do the work

Read the phase's §6.2 sub-section: its scope, its **Files:**, and what `done` means for it.

Delegate to a coder per [`context/executors.md`](../../../context/executors.md) if one is configured;
otherwise implement in-host. The coder's system prompt is
[`context/roles/coder.md`](../../../context/roles/coder.md).

The brief **cites paths, it does not paste files.** Point at `context/standards/README.md` and say to load
per its conditional table; point at `context/stack.md` and the phase's own section. Anything that can read
this repository can open them, and a brief that inlines them is a brief that goes stale.

Describe **what** needs to happen, never **how** to code it. Scope each delegated task to specific files.

## 7. Gate 1 — verification

Per the gate contract in [`context/workflow.md`](../../../context/workflow.md): read
[`context/verify.md`](../../../context/verify.md) and run its sections in order — Lint → Typecheck → Build →
Test.

**Never carry a copy of these commands here and never invent one.** A missing section is skipped and said
so, never faked. Exit 0 is the verdict regardless of summary text. If `verify.md` does not exist or has no
filled-in section, stop and say so. Docs-only changes run Lint plus a read of the diff.

A failure is the verdict — go to step 9 with the failing output verbatim as the feedback.

## 8. Gate 2 — review

Dispatch per [`context/executors.md`](../../../context/executors.md). With no independent reviewer
configured, review the diff yourself against the plan's review expectations and the standards — weaker, and
**say which one you ran.**

Require concrete evidence — file paths, command output — for every verdict, and a `P0`–`P3` severity on
every blocking finding.

- `PASS` or `PASS WITH NOTES` → the phase's work is done; go to step 10.
- `FAIL` → **write it to [`context/findings.md`](../../../context/findings.md) first, then** go to step 9.

**Write the finding before the loopback, not after it.** A verdict that lives only in this session's
transcript evaporates when the conversation ends — including a `P0` the cap never got to.

## 9. Loopback

Cap: **two loops per gate, per phase.**

Under the cap: re-brief with the prior implementation and the validator's feedback **verbatim — do not
summarise or paraphrase it** — plus the instruction to address only the failing items, refactor nothing
that passes, and expand no scope. Then re-run the same gate.

At the cap: **write a finding** (`P1` for a Gate 1 cap-out — a phase whose verification cannot pass is
blocked by definition), then escalate to the user with the current state and the last feedback.
**Escalating is not a substitute for recording.**

## 10. Close out the ledger row

In the same commit as the work:

- **All of the phase's scope landed and both gates passed** → `done`.
- **Some landed** → stays `in progress`, Note rewritten to name exactly what remains.
- **A gate hit its cap, or something external blocks it** → `blocked`, with the blocker in the Note.

**Never mark `done` on a coder's self-report** — the gate output is the evidence. **Refuse `done` while an
open `P0` or `P1` is tied to this phase**; leave it `in progress` and name the finding.

## 11. Report

- What changed, and which files.
- Gate 1 output, and Gate 2's verdict.
- Loopback counts, if any.
- Findings written or closed, by id.
- The phase's new ledger status, and which phase is next.

**When every phase is `done`, say so and name `/feature-close`.** Do not move files, stamp headers or sweep
references — that is a tier boundary, and crossing it is an explicit command the user runs, not a
side-effect of the last phase finishing.
