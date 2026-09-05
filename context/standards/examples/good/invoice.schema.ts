/**
 * Schema for the InvoiceTable example.
 *
 * Demonstrates the standards-preferred pattern:
 * - Single Zod schema as source of truth
 * - Inferred TypeScript type from the schema
 * - Shared between FE and BE (in a real project this would live in shared/schemas/)
 */

import { z } from "zod";

export const invoiceSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  status: z.enum(["draft", "open", "paid", "void"]),
  amount: z.number().nonnegative(),
  dueDate: z.coerce.date(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
