# React Anti-Patterns

## Giant Components

```tsx
// BAD — one component doing everything
function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortKey, setSortKey] = useState("date");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  // ... 200 more lines of JSX, logic, and effects
}

// GOOD — decomposed, composed
function InvoicePage() {
  return (
    <InvoiceLayout>
      <InvoiceFilters />
      <InvoiceTable />
      <InvoicePagination />
    </InvoiceLayout>
  );
}
```

## useEffect for Derived State

```tsx
// BAD
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD
const fullName = `${firstName} ${lastName}`;
```

## useEffect for Data Fetching

```tsx
// BAD
const [user, setUser] = useState(null);
useEffect(() => {
  fetchUser(id).then(setUser);
}, [id]);

// GOOD
const { data: user } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
});
```

## Prop Drilling

Prop drilling is when intermediate components accept props they don't use, only to forward them to a deeper child. The pain compounds as you add more shared values — every layer's signature grows.

```tsx
// BAD — Layout and Sidebar don't use `user`, they just forward it
function Page({ user }: { user: User }) {
  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  return (
    <div>
      <Header />
      <Sidebar user={user} />
      <Content />
    </div>
  );
}

function Sidebar({ user }: { user: User }) {
  return (
    <aside>
      <Nav />
      <UserMenu user={user} />
    </aside>
  );
}

function UserMenu({ user }: { user: User }) {
  return <button>{user.name}</button>;
}

// GOOD — Context lets UserMenu read `user` directly; intermediates carry nothing extra
function Page() {
  return <Layout />;
}

function UserMenu() {
  const { user } = useCurrentUser();
  return <button>{user.name}</button>;
}
```

When deciding between context, composition, or a store, see [state-management.md](state-management.md).

## Defensive Memoization

```tsx
// BAD — memoizing trivial values
const label = useMemo(() => `Hello, ${name}`, [name]);
const handleClick = useCallback(() => setOpen(true), []);

// GOOD — only memoize when there is a proven reason
const label = `Hello, ${name}`;
const handleClick = () => setOpen(true);
```

## State Synchronization Effects

```tsx
// BAD — syncing state with state
const [search, setSearch] = useState("");
const [filteredItems, setFilteredItems] = useState(items);

useEffect(() => {
  setFilteredItems(items.filter((i) => i.name.includes(search)));
}, [search, items]);

// GOOD — compute during render
const filteredItems = items.filter((i) => i.name.includes(search));
```

## Hook Mini-Frameworks

```tsx
// BAD — over-engineered hook that re-implements a library
function useDataFetcher<T>(url: string, options: FetcherOptions<T>) {
  const [state, dispatch] = useReducer(fetcherReducer, initialState);
  useEffect(() => {
    // 50 lines of custom fetching, caching, retry logic...
  }, [url, options]);
  return state;
}

// GOOD — use TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: [url],
  queryFn: () => fetch(url).then((r) => r.json()),
  retry: 3,
});
```

## Index as Key

```tsx
// BAD — unstable keys cause incorrect reconciliation
{items.map((item, index) => (
  <Item key={index} {...item} />
))}

// GOOD — stable, unique key
{items.map((item) => (
  <Item key={item.id} {...item} />
))}
```

## Spreading Unknown Props onto DOM Elements

```tsx
// BAD — unknown props forwarded to DOM, React will warn
function Card({ className, ...rest }: Record<string, unknown>) {
  return <div className={className} {...rest} />;
}

// GOOD — explicit allowed props
interface CardProps {
  className?: string;
  children: React.ReactNode;
}
function Card({ className, children }: CardProps) {
  return <div className={className}>{children}</div>;
}
```

## See Also

- [`use-effect.md`](use-effect.md) — when useEffect is wrong
- [`memoization.md`](memoization.md) — when memoization is wrong
- [`state-management.md`](state-management.md) — state hierarchy
- [`../examples/bad/`](../examples/bad/) — concrete anti-pattern examples
