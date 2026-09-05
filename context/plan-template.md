# <Feature> Plan

Written <YYYY-MM-DD>. <One line on what this is.> The `<name>` entry in
[`../roadmap.md`](../roadmap.md) is where this feature's status lives.

**Phase status lives in §6.1 of this document, and nowhere else.**

---

## 1. Why

<The problem, with evidence.>

## 2. Constraints

<What the solution may not do.>

## 3. Decisions

**D1.** <Decision.> Rejected: <alternative>, because <why>.

## 4. Design

<How it works.>

## 5. Risks

<What could go wrong, how it would show up, and the response.>

## 6. Phases

### 6.1 Status ledger

| # | Phase | Status | Depends on | Note |
|---|---|---|---|---|
| 1 | <name> | not started | — | |
| 2 | <name> | not started | 1 | |

Status is one of `not started`, `in progress`, `blocked`, `done`. `done` only when committed and verified,
and whoever finishes a phase updates the row in the same commit.

**Exactly one table in this document has these columns.** Do not add a second phase table — a
differently-shaped one nearby is a decoy that gets read by mistake.

### 6.2 The phases

#### Phase 1 — <name>

**Files:** <every path this phase creates or modifies>

**Scope:** <what it does>

**Done when:** <a condition checkable against the repo>

#### Phase 2 — <name>

**Files:** <every path this phase creates or modifies>

**Scope:** <what it does>

**Done when:** <a condition checkable against the repo>

## 7. Verification

<How to prove the feature works, beyond `context/verify.md` passing.>

## 8. Open questions

- <Anything the plan could not settle. An honest gap is worth more than an invented decision.>
