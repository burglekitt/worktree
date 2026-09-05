# shadcn/ui

## Purpose

shadcn/ui provides accessible, unstyled UI primitives built on Radix UI. Components are copied into your codebase — you own and modify them directly.

## Key Properties

- Built on Radix UI — keyboard navigation and ARIA patterns are correct by default
- Styled with Tailwind CSS + CSS variables
- Not a dependency — components live in your `src/components/ui/` directory
- Fully customizable — modify any component without fighting against the library

## Setup

```bash
pnpm dlx shadcn@latest init
```

This sets up:
- `components.json` — config
- `src/components/ui/` — where components are added
- CSS variable theme in `globals.css`

## Adding Components

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add table
```

Components are added to `src/components/ui/`. They are yours to modify.

## Customization

### Via CSS Variables (Preferred)

Edit the CSS variables in `globals.css`:

```css
@layer base {
  :root {
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }
}
```

### Via Component Modification

Fork the component directly in `src/components/ui/`. Changes survive upgrades because you own the file.

## Usage with Forms

shadcn/ui's `Form` component wraps React Hook Form:

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(schema),
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## DO

- Prefer shadcn/ui components over custom implementations for common UI patterns
- Use CSS variable customization before forking a component
- Keep `src/components/ui/` for shadcn components; use `src/shared/components/` for your own
- Update components via `shadcn@latest add <component>` when you want upstream fixes (manual review required)

## DO NOT

- Install shadcn/ui as a package dependency — it is a code generator
- Modify shadcn components inside `node_modules`
- Build custom dialog, dropdown, or popover implementations when Radix primitives are available
- Assume accessibility — review each component in context (color contrast, label associations)

## When to Fork a Component

Fork (copy and modify) when:
- The component needs significant structural changes
- You need different default props or variants permanently
- The upstream component API doesn't fit your use case

Do not fork to change only styles — use CSS variables instead.

## See Also

- [`tailwind.md`](tailwind.md) — utility classes and theming
- [`../react/accessibility.md`](../react/accessibility.md) — why Radix primitives are preferred
- [`../react/forms.md`](../react/forms.md) — shadcn/ui form components
