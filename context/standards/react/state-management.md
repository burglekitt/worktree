# State Management

## Hierarchy

Choose the simplest state mechanism that works. Escalate only when necessary.

```
1. URL state          — shareable, bookmarkable, free
2. Server state       — TanStack Query (cached, synchronized, background-refreshed)
3. Local state        — useState / useReducer
4. Context            — for shared UI state (theme, current user, modal stack)
5. Zustand            — only when Context is insufficient
6. Redux              — never
```

## URL State

Prefer URL state for anything that should be shareable, bookmarkable, or survive a refresh:

- Filters, search queries, pagination, selected tab
- Use TanStack Router's typed search params (validated with Zod)

```ts
// TanStack Router — typed search params
const search = invoicesRoute.useSearch();
const navigate = invoicesRoute.useNavigate();

function setStatus(status: InvoiceStatus) {
  navigate({ search: (prev) => ({ ...prev, status, page: 1 }) });
}
```

See [`../tooling/tanstack-router.md`](../tooling/tanstack-router.md) for the full pattern (route definition, validation, loaders).

## Server State — TanStack Query

For data that lives on the server, TanStack Query is the default:

```ts
const { data: invoices, isLoading } = useQuery({
  queryKey: ["invoices", filters],
  queryFn: () => fetchInvoices(filters),
  staleTime: 60_000,
});

const { mutate: createInvoice } = useMutation({
  mutationFn: createInvoiceFn,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  },
});
```

Do not duplicate server state into local state. Do not use `useEffect` + `useState` for data fetching.

## Local State

For UI-only state that does not need to be shared:

```ts
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");
```

Use `useReducer` when state transitions are complex or interrelated:

```ts
type Action =
  | { type: "SET_STEP"; step: number }
  | { type: "SUBMIT" }
  | { type: "RESET" };

function reducer(state: WizardState, action: Action): WizardState { ... }

const [state, dispatch] = useReducer(reducer, initialState);
```

## Context

Use Context for state that many components need but that does not belong in the server:

- Current user / session
- Theme / color scheme
- Open modals / toasts
- Feature flags

Keep Context providers small. Do not put everything in a single `AppContext`.

## Zustand

Use Zustand when:
- State is complex and cross-cutting enough that Context causes re-render issues
- Multiple independent slices of UI state need to be coordinated

```ts
const useInvoiceStore = create<InvoiceStore>((set) => ({
  selectedIds: [],
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),
}));
```

## Never Redux

Redux adds ceremony, boilerplate, and indirection that is not justified for modern React applications. TanStack Query + Zustand + URL state covers all real use cases with far less overhead.

## PRIORITY

```
URL state > Server state > Local state > Context > Zustand
```

## See Also

- [`../tooling/tanstack-router.md`](../tooling/tanstack-router.md) — typed URL state, loaders
- [`../tooling/tanstack-query.md`](../tooling/tanstack-query.md) — server state cache
- [`use-effect.md`](use-effect.md) — what useEffect is and isn't for
- [`forms.md`](forms.md) — form state management
- [`hooks.md`](hooks.md) — composing hooks for stateful logic
