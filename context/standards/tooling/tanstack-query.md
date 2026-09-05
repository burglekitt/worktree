# TanStack Query

The default solution for server state management. Replaces manual `useEffect` + `useState` data fetching entirely.

## Core Rules

- Use TanStack Query for any data that lives on the server — never duplicate it into local state
- Define `queryOptions` once and share them between loaders, components, and prefetches
- Use `useSuspenseQuery` when paired with route loaders or `<Suspense>` boundaries
- Use plain `useQuery` only when you need to render before the data resolves
- Invalidate queries on mutation success — don't manually update component state

## Setup

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,        // data stays fresh for 60s by default
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Query Options Pattern

Define query options as a function so the same definition works in loaders, components, and prefetches:

```ts
import { queryOptions } from "@tanstack/react-query";

export function invoiceQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["invoices", id],
    queryFn: () => fetchInvoice(id),
    staleTime: 30_000,
  });
}

// Component (with route loader prefetching — see tanstack-router.md)
const { data } = useSuspenseQuery(invoiceQueryOptions(invoiceId));

// Loader prefetch
loader: ({ context }) => context.queryClient.ensureQueryData(invoiceQueryOptions(id)),

// Manual prefetch (e.g., on hover, outside a route)
queryClient.prefetchQuery(invoiceQueryOptions(id));
```

This is the canonical pattern. Avoid defining query keys and functions inline at the call site.

## Queries

### Standard Query

Use when the component needs to render before data is available (initial mount without prefetch):

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ["invoices", filters],
  queryFn: () => fetchInvoices(filters),
});

if (error) return <ErrorState error={error} />;
if (isLoading) return <LoadingState />;
return <InvoiceTable invoices={data} />;
```

### Suspense Query

Use when paired with a route loader or `<Suspense>` boundary. No `isLoading` / `error` checks — boundaries handle them:

```ts
const { data: invoices } = useSuspenseQuery(invoiceQueryOptions(filters));
return <InvoiceTable invoices={invoices} />;
```

`<Suspense>` shows the fallback while loading. `<ErrorBoundary>` catches errors. See [`../react/error-boundaries.md`](../react/error-boundaries.md).

### Infinite Query

For cursor-paginated lists:

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ["invoices", filters],
  queryFn: ({ pageParam }) => fetchInvoices({ ...filters, cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

// data.pages is an array of pages; flatten with .flatMap(page => page.items)
```

See [`../architecture/api-design.md`](../architecture/api-design.md) for cursor pagination conventions.

## Mutations

### Basic Mutation

```ts
const { mutate, isPending } = useMutation({
  mutationFn: createInvoice,
  onSuccess: (newInvoice) => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  },
});
```

### Optimistic Updates

```ts
const { mutate } = useMutation({
  mutationFn: createInvoice,
  onMutate: async (newInvoice) => {
    await queryClient.cancelQueries({ queryKey: ["invoices"] });
    const previous = queryClient.getQueryData<Invoice[]>(["invoices"]);
    queryClient.setQueryData<Invoice[]>(["invoices"], (old = []) => [
      ...old,
      { ...newInvoice, id: "temp", status: "draft" },
    ]);
    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(["invoices"], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  },
});
```

## Query Key Conventions

Use arrays. Nest from general to specific. Filters go in a final object so they participate in cache keying:

```ts
["invoices"]                          // all invoices (broad)
["invoices", "123"]                   // single invoice
["invoices", "123", "comments"]       // nested resource
["invoices", { status: "open" }]      // filtered list
["invoices", { status: "open", page: 2 }]
```

Centralize query keys in a `queryKeys` factory for invalidation precision:

```ts
export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

// Invalidate all lists but keep individual details fresh
queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
```

## Invalidation Strategies

| After… | Invalidate… |
|---|---|
| `create` | List queries (`invoiceKeys.lists()`) |
| `update` (single resource) | The list **and** the specific detail (`invoiceKeys.detail(id)`) |
| `delete` | The list; remove the detail from cache (`queryClient.removeQueries`) |
| `bulk update` | The entire feature (`invoiceKeys.all`) |

`invalidateQueries` marks queries as stale and triggers refetch if they're active. `removeQueries` evicts them entirely.

## `staleTime` vs `gcTime`

- **`staleTime`** — how long data is considered fresh; while fresh, no background refetch
- **`gcTime`** (formerly `cacheTime`) — how long unused data is kept in memory after the last subscriber unmounts

Sensible defaults:
- List queries: `staleTime: 30_000`
- Detail queries: `staleTime: 60_000`
- Static reference data: `staleTime: Infinity` with explicit invalidation

## DO NOT

- Mix TanStack Query with manual `useEffect` fetch patterns
- Store server state in Zustand or Context — the query cache is the store
- Use TanStack Query for pure local UI state (modal open, selected tab without URL state)
- Define query keys inline at each call site — use `queryOptions` or a key factory
- Manually `setQueryData` for non-optimistic updates — invalidate instead

## PRIORITY

```
queryOptions (shared definition) > Inline query at call site
useSuspenseQuery + boundaries > useQuery + manual loading/error checks
Invalidate on mutation > Manual cache updates
```

## See Also

- [`tanstack-router.md`](tanstack-router.md) — loaders + `useSuspenseQuery` pattern
- [`../react/state-management.md`](../react/state-management.md) — when to use TanStack Query vs other state
- [`../react/error-boundaries.md`](../react/error-boundaries.md) — Suspense and ErrorBoundary pairing
- [`../architecture/api-design.md`](../architecture/api-design.md) — pagination, error shape
