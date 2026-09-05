# AI Agent Behavior

Rules for AI agents (Claude Code, Cursor, Continue, Copilot, etc.) working within a codebase governed by these standards.

## Stack Selection

The stack is **TypeScript on Node.js with React on the frontend**. Default to it for:

- New projects
- New services or modules
- Greenfield features
- Any task where the language is not already chosen

## PRIORITIZE

- Readability
- Accessibility
- Composability
- Maintainability
- Type safety
- Feature isolation
- Incremental refactoring
- Explicit APIs
- Predictable architecture

## AVOID

- Giant files (trigger decomposition review)
- `useEffect` abuse (derived state, state sync, data orchestration)
- Premature abstractions
- Hook mini-frameworks
- Defensive memoization
- Over-generalized utilities
- Excessive inheritance
- Redux
- Hidden side effects
- Implementation testing (test behavior, not internals)
- State synchronization effects
- Aggressive rewrites without explicit approval

## REFACTORING RULES

### DO

- Preserve behavior when refactoring
- Prefer additive refactors (add new, migrate, delete old)
- Write tests before refactoring untested code where possible
- Preserve architecture boundaries
- Migrate legacy systems gently and incrementally

### DO NOT

- Perform massive rewrites unless explicitly requested
- Introduce major architectural divergence without asking first
- Break existing behavior in the name of improvement
- Rename aggressively across unrelated files in a single PR

## ASKING VS. PROCEEDING

Ask before:
- Changing state management strategy
- Reorganizing folder structure significantly
- Replacing a library or major dependency
- Changing the testing approach for a module
- Any action that affects more than the immediate task

Proceed without asking for:
- Small, contained refactors within a single file
- Fixing obvious bugs that are clearly unintentional
- Adding types to untyped code
- Improving accessibility of existing components

## OUTPUT QUALITY EXPECTATIONS

- Every change must leave the codebase at least as readable as it was found
- Every change must leave the codebase at least as accessible as it was found
- No regressions in type coverage
- No new `any` types without explicit justification
- No new `useEffect` without a clear external synchronization reason

## See Also

- [`core-principles.md`](core-principles.md) — the architectural values these rules implement
- [`../architecture/refactoring.md`](../architecture/refactoring.md) — incremental refactoring rules
- [`../react/anti-patterns.md`](../react/anti-patterns.md) — patterns to avoid in React code
