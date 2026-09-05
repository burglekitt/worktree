# TanStack Router

## Core Rules

- Define routes as code (or file-based) with full type inference — no string-typed paths
- Validate all search params with Zod — typed and runtime-safe
- Load data in route loaders, consume with `useSuspenseQuery` — eliminates loading flicker on navigation
- Use route-level `pendingComponent` / `errorComponent` for navigation transitions; component-level `<Suspense>` / `<ErrorBoundary>` for in-page widgets
- Auth-guard with `beforeLoad` — redirect before the route renders, never inside the component
- Treat the URL as the source of truth for filters, search, pagination, and tab state

## Why Router + Query

TanStack Router and TanStack Query together change how data fetching is structured:

- **Loader prefetches data** before the component mounts
- **Component reads from cache** via `useSuspenseQuery` — synchronously returns cached data
- **No loading state on navigation** — the data is already there when the component renders
- **Single source of truth** — the query cache serves both loaders and components

The pattern flips the usual "fetch inside the component" model.

## Route Definition

### Code-Based Routes

Define routes as a tree of `createRoute` calls. Best for full type inference and explicit composition.

```ts
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

const rootRoute = createRootRoute({ component: RootLayout });

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  component: InvoicesPage,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: "$invoiceId",
  component: InvoiceDetailPage,
});

const routeTree = rootRoute.addChildren([invoicesRoute, invoiceDetailRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

### File-Based Routes

For larger apps, file-based routing reduces ceremony. Routes live in `src/routes/` and the generator creates the route tree:

```
src/routes/
  __root.tsx            ← root layout
  index.tsx             ← /
  invoices/
    index.tsx           ← /invoices
    $invoiceId.tsx      ← /invoices/:invoiceId
    _layout.tsx         ← shared layout for /invoices/*
```

Use the `@tanstack/router-plugin/vite` plugin to regenerate the route tree on save.

**When to choose which:** code-based for libraries, embedded apps, or small projects; file-based for production apps with many routes.

## Typed Path Params

Path params are inferred from the path string:

```ts
const invoiceDetailRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: "$invoiceId",
  component: InvoiceDetailPage,
});

function InvoiceDetailPage() {
  const { invoiceId } = invoiceDetailRoute.useParams(); // string, fully typed
  return <InvoiceDetail id={invoiceId} />;
}
```

For runtime-validated params (e.g., must be a CUID), use `parseParams`:

```ts
parseParams: ({ invoiceId }) => ({ invoiceId: z.string().cuid().parse(invoiceId) }),
```

## Typed Search Params

Search params are the canonical place for filters, search queries, pagination, and tab selection — anywhere the state should be shareable, bookmarkable, and survive a refresh.

```ts
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  validateSearch: z.object({
    status: z.enum(["all", "open", "paid"]).default("all"),
    page: z.number().int().positive().default(1),
    sort: z.enum(["dueDate", "amount"]).default("dueDate"),
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { status, page, sort } = invoicesRoute.useSearch();
  const navigate = invoicesRoute.useNavigate();

  function setStatus(status: InvoiceStatus) {
    navigate({ search: (prev) => ({ ...prev, status, page: 1 }) });
  }

  return <InvoiceTable status={status} page={page} sort={sort} onStatusChange={setStatus} />;
}
```

Search params are validated on every navigation. Invalid values are coerced or rejected by the schema.

## Loaders + TanStack Query (The Core Pattern)

The recommended pattern: loaders prefetch with `queryClient.ensureQueryData`, components consume with `useSuspenseQuery`.

```ts
// 1. Define the query options outside the route so loader + component share them
function invoicesQueryOptions(filters: InvoicesSearch) {
  return queryOptions({
    queryKey: ["invoices", filters],
    queryFn: () => fetchInvoices(filters),
    staleTime: 30_000,
  });
}

// 2. The loader prefetches into the query cache
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  validateSearch: invoicesSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(invoicesQueryOptions(deps)),
  component: InvoicesPage,
});

// 3. The component reads from the cache — synchronous, no loading state
function InvoicesPage() {
  const search = invoicesRoute.useSearch();
  const { data: invoices } = useSuspenseQuery(invoicesQueryOptions(search));
  return <InvoiceTable invoices={invoices} />;
}
```

What this gives you:
- **No loading flicker on navigation** — data is in cache before render
- **Stale-while-revalidate** — TanStack Query refetches in the background if stale
- **Cache reuse** — going back to the page hits the cache instantly
- **Prefetching** — `<Link preload="intent">` prefetches on hover

### Router Setup with QueryClient in Context

Pass the `queryClient` to the router so loaders can use it:

```tsx
const queryClient = new QueryClient({ /* ... */ });

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

## Pending and Error Components

Route-level components handle the boundary between routes. Different from in-page widgets.

```ts
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  loader: /* ... */,
  pendingComponent: InvoicesPending,
  errorComponent: InvoicesError,
  component: InvoicesPage,
});

function InvoicesPending() {
  return <TableSkeleton />;
}

function InvoicesError({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>We couldn't load invoices.</p>
      <p><small>{error.message}</small></p>
    </div>
  );
}
```

**Use route-level `pendingComponent` / `errorComponent`** for the entire route transition (loader runs, then renders).
**Use component-level `<Suspense>` / `<ErrorBoundary>`** for independent widgets within the page that can fail or load separately (see [`../react/error-boundaries.md`](../react/error-boundaries.md)).

## Auth Guards with `beforeLoad`

`beforeLoad` runs before the loader. It is the right place for authentication and authorization:

```ts
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { returnTo: location.href },
      });
    }
  },
  loader: /* ... */,
  component: DashboardPage,
});
```

`throw redirect(...)` short-circuits the route — the component never renders.

Pass `auth` through the router context (same pattern as `queryClient`).

## Code Splitting

Lazy-load route components to reduce initial bundle size:

```ts
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  component: lazyRouteComponent(() => import("./InvoicesPage")),
});
```

For file-based routes, prefix the file with `_` to make it lazy:

```
src/routes/invoices.lazy.tsx   ← lazy-loaded
```

## Route Context

Share data down the route tree without prop drilling:

```ts
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!, // filled in by the auth route
  },
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: ({ context }) => ({
    auth: { user: getCurrentUser(), isAuthenticated: !!getCurrentUser() },
  }),
});
```

Child routes inherit and can extend the context.

## Type-Safe Navigation

`Link`, `navigate`, and `redirect` are all typed against the route tree:

```tsx
import { Link } from "@tanstack/react-router";

// Path and params are fully typed — typos and missing params are compile errors
<Link to="/invoices/$invoiceId" params={{ invoiceId: invoice.id }}>
  View invoice
</Link>

// Search params are typed against the route's validateSearch schema
<Link
  to="/invoices"
  search={{ status: "open", page: 1 }}
>
  Open invoices
</Link>

// Preload on hover / focus
<Link to="/invoices/$invoiceId" params={{ invoiceId }} preload="intent">
  View
</Link>
```

Programmatic navigation:

```ts
const navigate = useNavigate();
navigate({ to: "/invoices/$invoiceId", params: { invoiceId } });
```

## Invalidation After Mutations

When a mutation changes data, invalidate the relevant queries and optionally navigate:

```tsx
const { mutate } = useMutation({
  mutationFn: createInvoice,
  onSuccess: async (newInvoice) => {
    await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    navigate({ to: "/invoices/$invoiceId", params: { invoiceId: newInvoice.id } });
  },
});
```

For server-driven navigation (e.g., after delete, go back to the list):

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  navigate({ to: "/invoices", search: { status: "all", page: 1 } });
};
```

## DO NOT

- Define routes with stringly-typed paths — use `createRoute` or file-based routing for type inference
- Fetch data inside the component on mount — use the loader
- Use `useEffect` to read URL params — use `useSearch` / `useParams`
- Put search-param logic in component state and sync it to the URL — use the router's `validateSearch`
- Skip `validateSearch` "just for now" — invalid params will leak into your queries and cause cache pollution
- Build custom auth-redirect logic inside components — use `beforeLoad`

## PRIORITY

```
Loader-prefetched + Suspense queries > Component-level fetching
Typed search params > Component state for shareable values
beforeLoad redirects > Component-level redirects
Route errorComponent > Component-level ErrorBoundary (for route-scoped errors)
```

## See Also

- [`tanstack-query.md`](tanstack-query.md) — query options, mutations, invalidation
- [`../react/state-management.md`](../react/state-management.md) — URL state at the top of the hierarchy
- [`../react/error-boundaries.md`](../react/error-boundaries.md) — component-level error and loading boundaries
- [`../architecture/api-design.md`](../architecture/api-design.md) — API client and pagination patterns
