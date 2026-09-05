# Input Validation

## Core Rule

Validate all external input at system boundaries. Never trust data from users, external APIs, or environment variables.

## System Boundaries

External data that must always be validated:

- HTTP request bodies, query params, path params, headers
- Form submissions
- URL search params parsed client-side
- Environment variables
- File uploads
- Data from third-party APIs
- `localStorage` / `sessionStorage` values
- `postMessage` events

Internal data (function calls within the same service, TypeScript types) does not need runtime validation — trust the type system.

## Preferred Tool: Zod

```ts
// API route — validate request body
import { z } from "zod";

const createInvoiceBody = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  dueDate: z.coerce.date().min(new Date()),
  recipientEmail: z.string().email(),
});

app.post("/api/invoices", async (req, res) => {
  const result = createInvoiceBody.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ errors: result.error.flatten() });
  }
  const invoice = await createInvoice(result.data);
  return res.status(201).json(invoice);
});
```

## Path and Query Params

```ts
const getInvoiceParams = z.object({
  id: z.string().cuid(),
});

const getInvoicesQuery = z.object({
  status: z.enum(["all", "open", "paid"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
```

## File Uploads

```ts
const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (f) => ["image/jpeg", "image/png", "application/pdf"].includes(f.type),
      "Only JPEG, PNG, and PDF files are allowed",
    ),
});
```

## DO NOT

- Pass `req.body` directly to a database query or ORM
- Use `any` for data received from external sources
- Trust `Content-Type` headers alone to determine what data was sent
- Rely on client-side validation as the only validation

## PRIORITY

```
Validate all external input > Trust internal TypeScript types
```

## See Also

- [typescript/validation.md](../typescript/validation.md) — Zod patterns
- [api-security.md](api-security.md) — additional API-level protections
