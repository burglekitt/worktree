# Refactoring

## Core Rules

- Preserve behavior
- Prefer additive refactors
- Write tests before refactoring untested code
- Avoid massive rewrites unless explicitly requested
- Ask before major architectural divergence

## Refactoring Strategies

### Additive Refactor (Preferred)

Add the new implementation alongside the old. Migrate callers incrementally. Delete the old when all callers are migrated.

```
Step 1: Add new implementation (zero callers)
Step 2: Migrate callers one by one
Step 3: Delete old implementation
```

This is always safer than a big-bang rewrite because:
- Each step is independently reviewable
- Regressions are isolated
- Rollback is possible at any step

### Strangler Fig

For large-scale feature replacements:

1. Identify the boundary (API, component interface, route)
2. Build the replacement behind the boundary
3. Route new traffic to the replacement
4. Verify equivalence
5. Remove the old implementation

### Extract

For large files that need decomposition:

```
Step 1: Read the file and identify responsibilities
Step 2: Pick one responsibility to extract
Step 3: Create the new file
Step 4: Move the code, update imports
Step 5: Run tests — fix regressions
Step 6: Repeat for the next responsibility
```

Do not extract all responsibilities in one commit. One extraction per PR is easier to review.

## Before Refactoring Untested Code

Write at least one integration test that covers the behavior you are preserving:

```
Step 1: Write a test that captures the current behavior
Step 2: Confirm the test passes
Step 3: Refactor
Step 4: Confirm the test still passes
```

## DO NOT

- Rename things across many files in the same PR as a behavior change
- Mix refactoring and feature changes in the same commit
- Perform a rewrite and call it a refactor
- Remove test coverage while refactoring

## Signs a Refactor Has Gone Wrong

- Tests are failing that were passing before
- The behavior is different — even if "improved"
- The PR is impossible to review because the diff is too large
- You are rebuilding instead of reshaping

## Asking Before Proceeding

Ask before:
- Reorganizing the folder structure of a feature
- Changing the state management approach
- Replacing a library dependency
- Changing how data flows through a module

## PRIORITY

```
Behavior preservation > Code quality improvement > Elegance
```

## See Also

- [`../philosophy/incremental-abstraction.md`](../philosophy/incremental-abstraction.md) — when to abstract
- [`../philosophy/ai-agent-behavior.md`](../philosophy/ai-agent-behavior.md) — agent refactoring rules
- [`../react/testing.md`](../react/testing.md) — write tests before refactoring untested code
- [`../tooling/ci.md`](../tooling/ci.md) — PR sizing and additive PRs
