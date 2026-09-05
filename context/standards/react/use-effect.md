# useEffect

## Core Rule

`useEffect` is an escape hatch for synchronizing with external systems. It is not a general-purpose lifecycle hook.

## VALID uses

- Synchronizing with external systems (WebSocket, EventEmitter, third-party widget)
- DOM APIs that require imperative access (focus management, scroll position, canvas)
- Subscriptions (event listeners, pub/sub, real-time)
- Timers and intervals
- Imperative bridges to non-React code

## INVALID uses

- Deriving state from props or other state
- Syncing two pieces of React state together
- Fetching data (use TanStack Query instead)
- Responding to user events (handle directly in event handlers)
- Updating state on prop change (compute during render instead)

## Examples

### Correct — external system sync

```ts
useEffect(() => {
  const socket = new WebSocket(url);
  socket.addEventListener("message", handleMessage);
  return () => {
    socket.removeEventListener("message", handleMessage);
    socket.close();
  };
}, [url, handleMessage]);
```

### Correct — DOM API

```ts
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);
```

### Incorrect — derived state

```ts
// BAD — deriving state with useEffect
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD — compute during render
const fullName = `${firstName} ${lastName}`;
```

### Incorrect — state synchronization

```ts
// BAD — syncing two pieces of state
useEffect(() => {
  setDraftValue(externalValue);
}, [externalValue]);

// GOOD — use a key to reset controlled state
<Input key={externalValue} defaultValue={externalValue} />
```

### Incorrect — data fetching

```ts
// BAD — manual fetch in useEffect
useEffect(() => {
  let cancelled = false;
  fetchUser(id).then((data) => {
    if (!cancelled) setUser(data);
  });
  return () => { cancelled = true; };
}, [id]);

// GOOD — use TanStack Query
const { data: user } = useQuery({
  queryKey: ["user", id],
  queryFn: () => fetchUser(id),
});
```

## Dependency Array Rules

- Always specify the dependency array — never omit it
- Include all reactive values used inside the effect
- If a dependency changes too often, consider `useRef` or restructuring
- Do not use `// eslint-disable-line react-hooks/exhaustive-deps` to suppress warnings — fix the underlying issue

## PRIORITY

```
No effect > Computed value > Event handler > useEffect
```

## See Also

- [`state-management.md`](state-management.md) — where state should actually live
- [`hooks.md`](hooks.md) — composing hooks without useEffect abuse
- [`../tooling/tanstack-query.md`](../tooling/tanstack-query.md) — data fetching without useEffect
- [`anti-patterns.md`](anti-patterns.md) — common useEffect mistakes
