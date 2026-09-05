# Testing

## Philosophy

Test behavior, not implementation. A test that breaks when you rename a variable is a bad test. A test that breaks when user-visible behavior changes is a good test.

Reference: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Tooling

- **Vitest** — test runner (fast, native ESM, compatible with Jest API)
- **Testing Library** — component testing (`@testing-library/react`, `@testing-library/user-event`)
- **Playwright** — E2E tests for critical user flows only

## DO

- Test from the user's perspective — what does the user see and do?
- Query by accessible role, label, or text — not by `data-testid` or CSS class
- Use `userEvent` over `fireEvent` for realistic interaction simulation
- Test the happy path and the critical error paths
- Write unit tests for pure utility functions and complex business logic
- Write integration tests for feature flows (form submission, data fetching, state transitions)

## DO NOT

- Test implementation details (internal state, private methods, component structure)
- Use snapshot tests — they break constantly and encode nothing meaningful
- Mock things you do not own (browser APIs, global state) without good reason
- Assert on CSS class names or DOM structure
- Write tests that are tightly coupled to component internals

## Query Priority

Follow Testing Library's recommended query priority:

```
1. getByRole          — best: matches what a screen reader sees
2. getByLabelText     — for form inputs
3. getByPlaceholderText — last resort for inputs
4. getByText          — for non-interactive elements
5. getByDisplayValue  — for form elements with a value
6. getByAltText       — for images
7. getByTitle         — for title attributes
8. getByTestId        — last resort only (requires data-testid attribute)
```

## Example — Integration Test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

test("submits the form with valid data", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<CreateInvoiceForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Title"), "Q4 Report");
  await user.type(screen.getByLabelText("Amount"), "500");
  await user.click(screen.getByRole("button", { name: "Create" }));

  expect(onSubmit).toHaveBeenCalledWith({ title: "Q4 Report", amount: 500 });
});

test("shows validation errors for empty fields", async () => {
  const user = userEvent.setup();

  render(<CreateInvoiceForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: "Create" }));

  expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
});
```

## Playwright — E2E (Critical Flows Only)

Reserve Playwright for flows that are:
- Business-critical (checkout, authentication, data export)
- Too complex to integration-test meaningfully
- Dependent on real browser behavior (file upload, clipboard, print)

```ts
test("user can log in and view their dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

## File Colocation

```
features/
  invoices/
    InvoiceTable.tsx
    InvoiceTable.test.tsx   ← colocated with the component
    useInvoiceSort.ts
    useInvoiceSort.test.ts  ← colocated with the hook
```

## PRIORITY

```
Integration tests > Unit tests > E2E tests
Behavior > Implementation
```

## See Also

- [`component-design.md`](component-design.md) — testable component structure
- [`hooks.md`](hooks.md) — testing custom hooks via the components that use them
- [`accessibility.md`](accessibility.md) — query by role, label, text
- [`../architecture/refactoring.md`](../architecture/refactoring.md) — write tests before refactoring untested code
