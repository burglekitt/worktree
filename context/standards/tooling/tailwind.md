# Tailwind CSS

## Core Rules

- Utility-first: use Tailwind classes, not custom CSS, by default
- Use CSS variables for theming — not hardcoded color values
- Minimize arbitrary values (`[value]` syntax)
- Support dark mode via CSS variables and Tailwind's `dark:` variant

## Setup (v4)

```bash
pnpm add tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/styles/globals.css */
@import "tailwindcss";
```

## Theming with CSS Variables

Define design tokens as CSS variables. Wire them into Tailwind:

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(55% 0.2 250);
  --color-primary-foreground: oklch(98% 0.01 250);
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(10% 0 0);
  --color-muted: oklch(95% 0 0);
  --color-border: oklch(88% 0 0);
  --radius: 0.5rem;
}

.dark {
  --color-background: oklch(10% 0 0);
  --color-foreground: oklch(98% 0 0);
  --color-muted: oklch(18% 0 0);
  --color-border: oklch(25% 0 0);
}
```

Usage:

```tsx
<div className="bg-background text-foreground border-border" />
```

## DO

- Use `cn()` (clsx + tailwind-merge) for conditional class merging
- Define component variants with `cva` (class-variance-authority)
- Use `text-foreground`, `bg-background` etc. for themeable values
- Group Tailwind classes logically: layout → spacing → typography → color → state

## DO NOT

- Use arbitrary values for things that should be design tokens: `text-[#ff6b35]`
- Use `@apply` extensively — defeats the purpose of utility-first
- Write custom CSS for things Tailwind handles natively

## `cn()` Helper

```ts
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<button className={cn("px-4 py-2 rounded", isActive && "bg-primary text-white")} />
```

## Component Variants with `cva`

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

## PRIORITY

```
Design tokens > Utility classes > Arbitrary values > Custom CSS
```

## See Also

- [`shadcn.md`](shadcn.md) — Tailwind + Radix components
- [`../react/accessibility.md`](../react/accessibility.md) — focus styles, contrast
- [`../react/component-design.md`](../react/component-design.md) — `cn` and `cva` patterns
