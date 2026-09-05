# Error Boundaries and Suspense

## Core Rules

- Wrap async / risky UI subtrees in error boundaries — never let a render error crash the whole app
- Co-locate boundaries with the feature they protect
- Pair `<Suspense>` with `<ErrorBoundary>` — loading and error states are two sides of the same boundary
- Provide actionable error UI — explain what failed and what the user can do

## Error Boundaries

React error boundaries catch errors thrown during render, in lifecycle methods, and in constructors of descendant components. They do **not** catch:

- Errors in event handlers (use try/catch or `.catch()`)
- Errors in async code (handle with TanStack Query's `onError` or `try/catch`)
- Errors in the boundary itself

Use [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) — it provides a clean hook + component API and avoids the class component boilerplate:

```tsx
import { ErrorBoundary } from "react-error-boundary";

function InvoiceErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>We couldn't load your invoices. Please try again.</p>
      <p><small>Error: {error.message}</small></p>
      <button type="button" onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <ErrorBoundary FallbackComponent={InvoiceErrorFallback}>
      <InvoiceList />
    </ErrorBoundary>
  );
}
```

## Where to Place Boundaries

Place boundaries at meaningful UI seams. There are two layers:

**Route-level** — use TanStack Router's `errorComponent` and `pendingComponent` for failures and loading during route transitions (loader runs, then renders). See [`../tooling/tanstack-router.md`](../tooling/tanstack-router.md).

**Component-level** — use `<ErrorBoundary>` and `<Suspense>` for independent widgets within a page that can fail or load separately from the route as a whole.

Typical layout:
- One route-level `errorComponent` per route
- Component-level boundaries around independent widgets (dashboard panels, charts, third-party embeds)
- One component-level boundary around any subtree that suspends independently of the route loader

```tsx
// Multiple boundaries — one failing widget doesn't kill the dashboard
function Dashboard() {
  return (
    <Layout>
      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <RevenueChart />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <RecentInvoices />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <NotificationsPanel />
      </ErrorBoundary>
    </Layout>
  );
}
```

## Suspense for Loading States

`<Suspense>` declaratively handles loading states for lazy components, suspended TanStack Query calls (with `useSuspenseQuery`), and React Server Components.

```tsx
import { Suspense, lazy } from "react";

const InvoiceTable = lazy(() => import("./InvoiceTable"));

export function InvoicesPage() {
  return (
    <ErrorBoundary FallbackComponent={InvoiceErrorFallback}>
      <Suspense fallback={<TableSkeleton />}>
        <InvoiceTable />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Pairing Error and Loading Boundaries

Loading + error are two sides of the same boundary. Always declare them together:

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<LoadingFallback />}>
    <FeatureContent />
  </Suspense>
</ErrorBoundary>
```

## Suspense with TanStack Query

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

function InvoiceTable() {
  // No isLoading / isError branching — the boundaries handle it
  const { data: invoices } = useSuspenseQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  return <table>...</table>;
}
```

## Loading and Empty States

A complete data-fetching UI has four states:

- **Loading** — handled by `<Suspense>` or `isLoading` flag
- **Error** — handled by `<ErrorBoundary>` or `error` flag
- **Empty** — no data found; show a helpful empty state, not a blank screen
- **Success** — render the data

```tsx
if (invoices.length === 0) {
  return (
    <div>
      <p>No invoices yet.</p>
      <button type="button" onClick={onCreate}>Create your first invoice</button>
    </div>
  );
}
```

## Skeleton Loaders

For above-the-fold content, use skeleton loaders (placeholder shapes) instead of spinners — they reduce perceived load time and prevent layout shift.

```tsx
function TableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading invoices">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded mb-2" />
      ))}
    </div>
  );
}
```

## Reporting Errors

In an `<ErrorBoundary>`, send caught errors to your error monitoring service:

```tsx
<ErrorBoundary
  FallbackComponent={InvoiceErrorFallback}
  onError={(error, info) => {
    reportError(error, { componentStack: info.componentStack });
  }}
>
  <InvoiceList />
</ErrorBoundary>
```

See [`tooling/observability.md`](../tooling/observability.md) for error monitoring patterns.

## DO NOT

- Wrap the entire app in a single error boundary — a leaf failure should not blank the whole UI
- Show a generic "Something went wrong" message — give specific, actionable feedback
- Swallow the error in the fallback without reporting it
- Use `<Suspense>` for things that don't actually suspend (regular `useState`, non-suspended queries)

## PRIORITY

```
Co-located boundaries > Single global boundary
Specific error UI > Generic fallback
Suspense + ErrorBoundary together > Either alone
Route-level errorComponent (route transitions) > Component-level ErrorBoundary (widgets)
```

## See Also

- [`../tooling/tanstack-router.md`](../tooling/tanstack-router.md) — route-level `pendingComponent` / `errorComponent`
- [`../tooling/tanstack-query.md`](../tooling/tanstack-query.md) — `useSuspenseQuery` for component-level boundaries
- [`../tooling/observability.md`](../tooling/observability.md) — reporting caught errors to monitoring
