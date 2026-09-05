# TanStack

The TanStack family is the preferred toolkit for routing, server state, and forms.

| Library | Doc | Purpose |
|---|---|---|
| TanStack Router | [`tanstack-router.md`](tanstack-router.md) | Type-safe routing, loaders, typed search params |
| TanStack Query | [`tanstack-query.md`](tanstack-query.md) | Server state, caching, mutations |
| TanStack Form | [`../react/forms.md`](../react/forms.md) | Type-safe form state with schema validation |

## Why TanStack

- Each library is independent but composes cleanly with the others
- Type inference flows end-to-end — fewer hand-typed DTOs
- Schema validation (Zod) provides a consistent backbone across router, query, and form
- Router + Query together eliminate loading flicker on navigation — see [`tanstack-router.md`](tanstack-router.md)

## When All Three Compose

A typical data flow uses all three:

1. **Router** loads data in a `loader` via `queryClient.ensureQueryData`
2. **Query** caches it; components consume it via `useSuspenseQuery`
3. **Form** mutations call `queryClient.invalidateQueries` after submission
4. The Router navigates to the next route, which may already be prefetched

## See Also

- [`../react/state-management.md`](../react/state-management.md) — state hierarchy (URL > server > local > context)
- [`../react/forms.md`](../react/forms.md) — TanStack Form patterns
- [`../architecture/api-design.md`](../architecture/api-design.md) — API contracts that feed these libraries
