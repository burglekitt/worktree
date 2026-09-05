# Hooks

## Core Rules

- Use hooks to encapsulate reusable stateful behavior
- Keep hooks composable — hooks should call other hooks, not re-implement logic
- Before writing a custom hook, check if a solution already exists

## Check First

Before writing a custom hook:

1. Check [`@uidotdev/usehooks`](https://usehooks.com/) — covers most common patterns
2. Check if TanStack Query, TanStack Router, or Zustand handles your case
3. Check if a plain utility function (non-hook) is sufficient

## DO

- Name hooks with the `use` prefix
- Keep hooks focused on a single behavior
- Compose hooks from smaller hooks
- Return only what the caller needs — avoid returning large objects when specific values suffice
- Expose stable references with `useCallback` when callbacks are drilled or passed to external APIs

## DO NOT

- Create hook mini-frameworks with complex internal state machines
- Wrap `useState` purely to rename it — that is indirection, not abstraction
- Hide side effects or subscriptions without documenting them
- Create hooks that only one component ever calls (unless the hook isolates complexity)
- Use hooks to share instance state between unrelated components — use context or a store instead

## Good Hook Shape

```ts
// Focused, composable, clear return
function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, open, close, toggle };
}
```

## Bad Hook Shape

```ts
// BAD — wraps useState purely for renaming
function useModalOpen() {
  const [isOpen, setIsOpen] = useState(false);
  return [isOpen, setIsOpen] as const;
}

// BAD — hidden side effect with no documentation
function useUserData(userId: string) {
  const [data, setData] = useState(null);
  useEffect(() => {
    // secretly sends analytics on every render
    track("user-viewed");
    fetchUser(userId).then(setData);
  }, [userId]);
  return data;
}
```

## Composing Hooks

```ts
function useInvoiceTable(filters: InvoiceFilters) {
  const { data, isLoading } = useInvoices(filters); // data fetching
  const { sorted, sortKey, setSortKey } = useSort(data); // sort behavior
  const { paginated, page, setPage } = usePagination(sorted); // pagination
  return { invoices: paginated, isLoading, sortKey, setSortKey, page, setPage };
}
```

## PRIORITY

```
Composability > Encapsulation > Abstraction
```

## See Also

- [use-effect.md](use-effect.md)
- [memoization.md](memoization.md)
- [state-management.md](state-management.md)
