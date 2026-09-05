# Readability

## Core Rule

Code is read far more than it is written. Optimize for the reader.

## DO

- Write short, focused files with a single primary responsibility
- Prefer flat over deeply nested logic
- Use early returns to reduce nesting
- Keep function bodies short — if it doesn't fit on one screen, consider splitting
- Express intent in names, not comments
- Make control flow obvious

## DO NOT

- Write comments that explain what the code does (use a better name instead)
- Chain more than 3–4 operations without an intermediate named variable
- Use ternaries for non-trivial conditions
- Nest ternaries
- Write clever one-liners that require mental parsing

## Comments

Write a comment only when the **why** is non-obvious:
- A hidden constraint or business rule
- A workaround for a specific bug or browser quirk
- A subtle invariant that would surprise a reader

Do not write comments that describe what the code does. The code already says that.

```ts
// BAD: explains what
// increment the counter
count += 1;

// GOOD: explains why
// Safari fires the resize event on scroll — debounce to avoid layout thrash
window.addEventListener("resize", debouncedResize);
```

## Control Flow

Prefer:

```ts
// early return over nested if
if (!user) return null;
if (!user.isActive) return <Suspended />;

return <Dashboard user={user} />;
```

Over:

```ts
if (user) {
  if (user.isActive) {
    return <Dashboard user={user} />;
  } else {
    return <Suspended />;
  }
}
return null;
```

## Naming

Names should make a reader's job easier:

- `isLoading` not `loading` (boolean prefix)
- `formatCurrency` not `format` (specific action)
- `selectedUserId` not `id` (entity + role)
- `InvoiceLineItemRow` not `Row` (full context)

## PRIORITY

```
Obviousness > Brevity > Cleverness
```

## See Also

- [`maintainability.md`](maintainability.md) — colocation, deletability
- [`../typescript/naming.md`](../typescript/naming.md) — naming conventions
- [`../react/component-design.md`](../react/component-design.md) — file size and decomposition signals
