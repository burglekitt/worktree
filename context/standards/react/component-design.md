# Component Design

## Core Rules

- One file, one primary responsibility
- Prefer feature-driven colocation over organization-by-type
- Prefer composition over prop drilling
- Avoid gigantic files — large files signal decomposition is needed

## Feature-Driven Colocation

```
features/
  invoices/
    InvoiceTable.tsx
    InvoiceTable.test.tsx
    InvoiceRow.tsx
    InvoiceFilters.tsx
    useInvoiceSort.ts
    invoice.types.ts
    invoice.api.ts
```

Do not scatter invoice logic across `components/`, `hooks/`, `types/`, `api/` at the root level.

## DO

- Keep components reasonably scoped — render one thing well
- Decompose when a file becomes hard to scan
- Use composition to avoid deep prop drilling
- Use compound components for tightly coupled UI groups
- Prefer explicit props over spreading unknown props onto DOM elements
- Forward refs with `forwardRef` when wrapping native elements

## DO NOT

- Pass more than 4–5 props through intermediate components without reconsidering the design
- Put business logic directly in JSX — extract to a variable or function
- Use default exports for everything — named exports improve refactorability
- Render large lists inline without key management and performance consideration

## Compound Components

Use compound components when a group of UI elements are tightly coupled and share state:

```tsx
// Usage
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="details">Details</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="overview"><Overview /></Tabs.Panel>
  <Tabs.Panel value="details"><Details /></Tabs.Panel>
</Tabs>
```

## Prop Design

Define props as a named `interface` above the component. Do not define prop types inline.

```tsx
// GOOD — named interface above the component
interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick: (id: string) => void;
  isLoading?: boolean;
}

export function InvoiceTable({ invoices, onRowClick, isLoading }: InvoiceTableProps) {
  ...
}

// BAD — inline object type
export function InvoiceTable({
  invoices,
  onRowClick,
}: {
  invoices: Invoice[];
  onRowClick: (id: string) => void;
}) {
  ...
}

// BAD — type alias when interface would do
type InvoiceTableProps = {
  invoices: Invoice[];
  onRowClick: (id: string) => void;
};
```

Naming: suffix the interface with `Props` and prefix with the component name (`InvoiceTableProps`, not `Props`).

### Variant Props

```tsx
// BAD — boolean props for variants
<Button primary large disabled />

// GOOD — explicit variant props
<Button variant="primary" size="lg" disabled />
```

### Avoid Spreading Unknown Props

```tsx
// BAD — spreading unknown props onto DOM
function Card({ className, ...rest }: unknown) {
  return <div className={className} {...rest} />;
}

// GOOD — explicit allowed props
interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}
```

## File Size Signals

Trigger a decomposition review when:
- A file exceeds ~300 lines
- A component handles multiple unrelated concerns
- Props grow beyond 8–10 items
- JSX exceeds what fits on a single screen

## PRIORITY

```
Single responsibility > Reuse > Brevity
```

## See Also

- [hooks.md](hooks.md)
- [state-management.md](state-management.md)
- [accessibility.md](accessibility.md)
- [anti-patterns.md](anti-patterns.md)
