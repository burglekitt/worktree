# Executors

How this project dispatches a **coder** and a **reviewer**. Hand-written prose, read fresh at dispatch
time — the exact parallel to [`verify.md`](verify.md), and for the same reason: a skill that hardcodes an
invocation bakes one machine's setup into a tool that ships everywhere.

Configured by `/onboard` on 2026-09-05.

## Coder

**Not configured — implement in-host.**

This is a deliberate choice, not a gap. The host implements directly; no external coder CLI is dispatched,
so the repository-read test in `/onboard` Step 2 does not apply and no invocation is recorded here.

`codex` and `cursor-agent` are both present on the maintainer's machine and were considered. If either is
adopted later, write its exact invocation here along with any directory or permission scoping, test that it
can read this repository unaided before trusting it, and record the result of that test — the standing
rules below say why the answer changes how briefs are written. Its system prompt is
[`roles/coder.md`](roles/coder.md).

## Reviewer

**The bundled `reviewer` subagent, dispatched with the Agent tool.**

```
Agent(subagent_type: "reviewer", …)
```

Its definition is [`.claude/agents/reviewer.agent.md`](../.claude/agents/reviewer.agent.md) — tool-owned,
replaced on update. It runs with `Read, Grep, Glob, Bash` only, gathers evidence before forming a verdict,
and emits `PASS | PASS WITH NOTES | FAIL` with a `P0`–`P3` severity on every blocking finding. That is the
Gate 2 contract's shape exactly, so nothing has to be mapped or translated at the gate.

Give it the implementation output, the plan's review checklist, and the verification result. It does not
re-run verification and it does not fix anything.

Two alternatives were considered and rejected on 2026-09-05:

- **`/code-review`** reports findings by category (`correctness`, `simplification`) rather than `P0`–`P3`,
  which would put an undefined translation step inside the gate. Its `ultra` level runs in the cloud, is
  user-triggered and billed, and **cannot be launched by the host** — so it can never serve as the Gate 2
  executor. It remains useful when a human wants a deeper look; it is not the gate.
- **The host reviewing its own diff** is the fallback if the subagent is ever unavailable. It is weaker
  than an independent reviewer, and any gate run that falls back to it must say so.

## The contract, whatever is configured

A review happens, it returns a verdict with a `P0`–`P3` severity on every blocking finding, and a `FAIL`
writes a finding to [`findings.md`](findings.md) **before** the loopback.

## Standing rules for any external executor

- **Exit code alone proves nothing.** A CLI can exit 0 after hitting a usage limit mid-run, having
  completed most but not provably all of a brief. Grep the captured output for exhaustion and error
  markers before trusting a summary, and on a hit check `git status` and each acceptance criterion
  individually.
- **Take the model from the CLI's own config**, not from a flag written here. A hardcoded model flag is one
  more place to update when models turn over, and a rejected model can still exit 0 having written nothing.
- **No blanket permission-bypass flag.** Scope permissions in the CLI's own config instead. A standing
  bypass-everything instruction in a committed file is persistent privilege escalation.
- **Assume the executor can read this repository** unless you have tested otherwise. Briefs cite paths;
  they do not paste file contents. If an executor genuinely has no filesystem access, say so here — that is
  the one case where a brief has to carry content inline.
