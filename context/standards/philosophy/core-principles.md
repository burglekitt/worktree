# Core Engineering Principles

## Core Principle

Prefer explicit, composable, feature-oriented architecture over generalized abstractions and centralized complexity.

## Architectural Values

### DO

- Composition over inheritance
- Readability over cleverness
- Explicitness over magic
- Feature ownership over centralized organization
- Incremental abstraction over premature DRY
- Maintainability over premature optimization
- Colocation over fragmentation
- Accessibility-first development
- Strong type safety
- Predictable data flow

### PRIORITY

```
Readability > Maintainability > Performance > Cleverness
```

## Applying These Values

**Colocation** — Keep feature-specific code inside the feature. Move to shared only when genuinely reused by 3+ features.

**Incrementalism** — Start simple. Add abstraction when the need is proven, not anticipated.

**Explicitness** — Prefer code that is obvious over code that is elegant. A future reader should not need to trace magic to understand behavior.

**Feature ownership** — A feature folder owns its components, hooks, types, and tests. It does not scatter logic across the codebase by type.

**Accessibility first** — Semantic HTML and keyboard support are not optional. They are part of the definition of done.

**Type safety** — Types are documentation and safety nets. Avoid `any`, type assertions, and type gymnastics.

**Predictable data flow** — Data flows downward. Side effects are explicit and isolated. State changes are traceable.

## See Also

- [`ai-agent-behavior.md`](ai-agent-behavior.md) — concrete rules derived from these principles
- [`maintainability.md`](maintainability.md) — colocation, deletability, naming
- [`readability.md`](readability.md) — obvious over clever
- [`incremental-abstraction.md`](incremental-abstraction.md) — when to abstract vs. inline
