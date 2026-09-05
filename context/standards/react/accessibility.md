# Accessibility

## Core Rule

Accessibility is not optional. It is part of the definition of done.

## Requirements

- Semantic HTML first — use the right element for the job
- All interactive elements must be keyboard accessible
- All interactive elements must be usable by screen readers
- All form inputs must have associated labels
- Color is never the only means of conveying information
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA)

## Semantic HTML

```tsx
// BAD — no semantics
<div onClick={handleSubmit}>Submit</div>
<div className="heading">Invoice Details</div>

// GOOD — correct semantics
<button type="submit" onClick={handleSubmit}>Submit</button>
<h2>Invoice Details</h2>
```

Use the correct element:
- `<button>` for actions
- `<a>` for navigation
- `<h1>`–`<h6>` for headings (in order, no skipping)
- `<ul>` / `<ol>` / `<li>` for lists
- `<table>` for tabular data (with `<caption>`, `<th scope>`)
- `<nav>` for navigation regions
- `<main>`, `<aside>`, `<header>`, `<footer>` for landmarks

## Form Labeling

```tsx
// BAD — no label association
<div>
  <span>Email</span>
  <input type="email" />
</div>

// GOOD — explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// GOOD — wrapped label
<label>
  Email
  <input type="email" />
</label>
```

Never use `placeholder` as a substitute for a label.

## Keyboard Navigation

- All interactive elements must be reachable with Tab
- All interactive elements must be activatable with Enter or Space
- Dialogs must trap focus while open and restore focus on close
- Menus must support Arrow key navigation
- Escape must close dialogs, dropdowns, and menus

## ARIA — Use Only When Necessary

Prefer semantic HTML. Use ARIA only when a native element cannot express the required semantics.

```tsx
// BAD — redundant ARIA
<button role="button" aria-label="Submit">Submit</button>

// GOOD — ARIA only when HTML cannot express it
<div role="status" aria-live="polite">{statusMessage}</div>
```

Common correct ARIA uses:
- `aria-label` / `aria-labelledby` — when visible label is absent
- `aria-describedby` — for additional descriptions (error messages, help text)
- `aria-expanded` — for toggleable regions
- `aria-live` — for dynamic content announcements
- `aria-invalid` — for form validation errors

## Images

```tsx
// Decorative — hide from assistive technology
<img src="decoration.svg" alt="" />

// Informative — describe the content
<img src="invoice-preview.png" alt="Preview of invoice #1234 for $500" />

// Icon buttons — label the action, not the icon
<button aria-label="Download invoice">
  <DownloadIcon aria-hidden="true" />
</button>
```

## Focus Visibility

Never remove focus outlines without providing an equivalent visible replacement:

```css
/* BAD */
:focus { outline: none; }

/* GOOD */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

## shadcn/ui and Radix

Prefer shadcn/ui components built on Radix UI primitives — they handle keyboard navigation and ARIA patterns correctly out of the box. Do not replace them with custom implementations unless there is a specific, documented reason.

## PRIORITY

```
Semantic HTML > ARIA > Custom implementation
```

## See Also

- [`component-design.md`](component-design.md) — composable, accessible components
- [`forms.md`](forms.md) — label, error, and keyboard patterns
- [`../tooling/shadcn.md`](../tooling/shadcn.md) — Radix-based primitives with a11y built in
