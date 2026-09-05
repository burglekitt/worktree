# Incremental Abstraction

## Core Rule

Abstract when the need is proven. Inline when the need is uncertain.

## The Three-Instance Rule

Do not extract a shared abstraction until you have at least three real, distinct use cases. Two similar things may be coincidence. Three is a pattern.

## Progression

```
Inline → Local function → Shared utility → Published package
```

Move right only when left is insufficient. Do not start at the right.

## DO

- Duplicate small pieces of logic until the pattern is clear
- Extract to a local function first, before considering a shared module
- Name extracted abstractions after what they do, not what they contain
- Keep abstractions small and single-purpose

## DO NOT

- Create a utility file on the first use
- Extract "just in case" it is needed elsewhere
- Build generic frameworks from a single use case
- Name abstractions by what they wrap (`useUserData` wrapping `useQuery` is not an abstraction — it is indirection)

## Signs You Are Abstracting Too Early

- The abstraction has only one caller
- The abstraction has more configuration options than callers
- You are passing flags to switch between behaviors (`isEdit`, `mode: 'create' | 'edit'`)
- The abstraction is harder to understand than the code it replaces

## Signs You Should Abstract Now

- Three or more places duplicate the same logic with minor variations
- A bug was fixed in one place but exists in two others
- A feature requirement forced you to update the same logic in multiple files

## PRIORITY

```
Clarity of local code > DRY
```

## See Also

- [`maintainability.md`](maintainability.md) — deletability and naming
- [`../architecture/shared-code.md`](../architecture/shared-code.md) — when to promote to `shared/`
- [`../architecture/refactoring.md`](../architecture/refactoring.md) — additive refactor strategy
