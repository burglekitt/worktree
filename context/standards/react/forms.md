# Forms

## Core Rules

- Prefer controlled inputs
- Validate with a shared Zod schema (used on both client and server)
- Use optimistic updates for responsive UIs
- Handle loading and error states explicitly

## Preferred Tooling

**TanStack Form** is the preferred choice — integrates with TanStack Query and supports schema validation natively.

**React Hook Form** is an acceptable alternative — mature, well-documented, minimal re-renders.

Do not build custom form state management with `useState` arrays.

## TanStack Form Pattern

```tsx
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { createInvoiceSchema } from "~/features/invoices/invoice.schema";

function CreateInvoiceForm() {
  const form = useForm({
    defaultValues: { title: "", amount: 0 },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: createInvoiceSchema,
    },
    onSubmit: async ({ value }) => {
      await createInvoice(value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field
        name="title"
        children={(field) => (
          <label>
            Title
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((error) => (
              <span key={error} role="alert">{error}</span>
            ))}
          </label>
        )}
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

## React Hook Form Pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateInvoice, createInvoiceSchema } from "~/features/invoices/invoice.schema";

function CreateInvoiceForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoice>({
    resolver: zodResolver(createInvoiceSchema),
  });

  const onSubmit = async (data: CreateInvoice) => {
    await createInvoice(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="title">Title</label>
      <input id="title" {...register("title")} />
      {errors.title && <span role="alert">{errors.title.message}</span>}
      <button type="submit" disabled={isSubmitting}>Create</button>
    </form>
  );
}
```

## Shared Schema

```ts
// features/invoices/invoice.schema.ts
import { z } from "zod";

export const createInvoiceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  dueDate: z.coerce.date().min(new Date(), "Due date must be in the future"),
});

export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
```

## Optimistic Updates

```ts
const { mutate } = useMutation({
  mutationFn: createInvoice,
  onMutate: async (newInvoice) => {
    await queryClient.cancelQueries({ queryKey: ["invoices"] });
    const previous = queryClient.getQueryData(["invoices"]);
    queryClient.setQueryData(["invoices"], (old: Invoice[]) => [
      ...old,
      { ...newInvoice, id: "temp", status: "pending" },
    ]);
    return { previous };
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(["invoices"], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  },
});
```

## DO NOT

- Build form state with multiple `useState` calls
- Duplicate validation logic between client and server
- Submit without disabling the submit button during submission
- Leave error states unhandled

## PRIORITY

```
Schema validation > Controlled inputs > Optimistic updates
```

## See Also

- [`../typescript/validation.md`](../typescript/validation.md) — Zod schema patterns
- [`accessibility.md`](accessibility.md) — labels, errors, keyboard support
- [`../tooling/tanstack-query.md`](../tooling/tanstack-query.md) — mutations and cache invalidation
- [`../tooling/shadcn.md`](../tooling/shadcn.md) — shadcn/ui form components
