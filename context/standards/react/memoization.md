# Memoization

## Core Rule

Memoize proven performance bottlenecks. Do not memoize speculatively.

## DO

- Use `useCallback` for callbacks passed to heavily optimized child components or external APIs that need stable references
- Use `useMemo` for computationally expensive operations that have been profiled
- Use `React.memo` on components that receive stable props and re-render frequently with identical inputs

## DO NOT

- Wrap every function in `useCallback` by default
- Wrap every value in `useMemo` by default
- Use memoization to silence exhaustive-deps lint warnings
- Use `React.memo` on every component
- Reach for memoization before profiling

## The Cost of Memoization

Every `useMemo` and `useCallback` adds:
- Memory overhead (the cached value + the dependency array)
- Comparison overhead (shallow equality check on every render)
- Cognitive overhead (the reader must understand what is being memoized and why)

These costs are only worth paying when the avoided re-render or recalculation is measurably expensive.

## When `useCallback` Makes Sense

```tsx
// GOOD — stable callback passed to a memoized child
const handleRowClick = useCallback((id: string) => {
  navigate(`/invoices/${id}`);
}, [navigate]);

return <InvoiceTable onRowClick={handleRowClick} />;
```

## When `useMemo` Makes Sense

```tsx
// GOOD — expensive computation, profiled
const sortedAndFilteredInvoices = useMemo(() => {
  return invoices
    .filter(matchesFilters)
    .sort(bySortKey(sortKey));
}, [invoices, matchesFilters, sortKey]);
```

## When Memoization Is Unnecessary

```tsx
// BAD — trivial computation, memoization is noise
const label = useMemo(() => `Hello, ${name}`, [name]);

// GOOD
const label = `Hello, ${name}`;
```

```tsx
// BAD — callback not passed anywhere that needs stability
const handleClick = useCallback(() => setOpen(true), []);

// GOOD
const handleClick = () => setOpen(true);
```

## Profiling First

Before adding memoization, use React DevTools Profiler to confirm:
1. The component is re-rendering
2. The re-render is caused by the thing you are memoizing
3. The re-render is causing a measurable performance problem

## PRIORITY

```
Readability > Micro-optimization
```

## See Also

- [`component-design.md`](component-design.md) — decomposition over memoization
- [`anti-patterns.md`](anti-patterns.md) — defensive memoization
- [`../tooling/observability.md`](../tooling/observability.md) — Web Vitals for real performance signals
