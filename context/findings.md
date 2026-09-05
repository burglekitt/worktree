# Findings

Defects that outlive the session that found them. A reviewer `FAIL`, a verification gate that hits its
loopback cap, or a defect found by hand all land here — **before** the loopback, not after it, so a finding
survives even when the cap is hit and the task is escalated.

## Contract

**Severity.** `P0` breaks production or data. `P1` blocks a phase or a gate. `P2` is a real defect that
does not block. `P3` is a note worth not losing.

**Tied to.** Either a phase — `<feature-name> Phase <n>` — or `ad-hoc` for a finding raised by
`/orchestrate` outside any feature.

**Gating.** An open `P0` or `P1` tied to a phase blocks that phase from being marked `done`, and blocks
`/feature-close` on the feature that owns it.

**Closing.** A finding closes when **the gate that raised it re-passes**, citing that run. There is no
"fixed but unverified" state — that implies an owner this workflow does not have.

**Bound.** Closed findings leave this file: a feature's at `/feature-close`, folded into the retiring
plan's own log; an `ad-hoc` one at the start of the next `/orchestrate`. This file must not grow for the
life of the project.

**Shape.** Entries go under **Open** below, newest last, and look like this:

> ### F-001 — P1 — one line naming the defect
>
> **Tied to:** some-feature Phase 2 · **Raised:** YYYY-MM-DD (by the gate that raised it, or "hand")
>
> What is wrong, where, and why it matters. Cite the file and the evidence.
>
> **Closes when:** the condition that closes it, naming the gate run that would prove it.

---

## Open

## Closed

