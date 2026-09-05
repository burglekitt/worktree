/**
 * GOOD EXAMPLE: Feature-driven, colocated, accessible invoice table
 *
 * Demonstrates:
 * - Feature-colocated hook and types
 * - TanStack Query for server state
 * - URL state for filters
 * - Accessible table markup
 * - Explicit props, no spreading unknown props
 * - No useEffect for data fetching or derived state
 * - Controlled loading and error states
 */

import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { type Invoice, invoiceSchema } from "./invoice.schema";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceTableProps {
  onRowClick: (id: string) => void;
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchInvoices(status: string): Promise<Invoice[]> {
  const response = await fetch(`/api/invoices?status=${status}`);
  if (!response.ok) throw new Error(`Failed to fetch invoices: ${response.statusText}`);
  const data = await response.json();
  return invoiceSchema.array().parse(data);
}

// ─── Feature hook ─────────────────────────────────────────────────────────────

function useInvoiceTable() {
  // URL state — shareable, bookmarkable
  const { status = "all" } = useSearch({ from: "/invoices" });

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["invoices", status],
    queryFn: () => fetchInvoices(status),
    staleTime: 30_000,
  });

  // Derived state — computed during render, no useEffect
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return { invoices, isLoading, error, totalAmount, status };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoiceTable({ onRowClick }: InvoiceTableProps) {
  const { invoices, isLoading, error, totalAmount } = useInvoiceTable();

  if (error) {
    return (
      <div role="alert">
        <p>We couldn't load your invoices. Please refresh the page or contact support.</p>
        <p>
          <small>Error: {error.message}</small>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div aria-busy="true" aria-label="Loading invoices">Loading…</div>;
  }

  if (invoices.length === 0) {
    return <p>No invoices found.</p>;
  }

  return (
    <section aria-labelledby="invoice-table-heading">
      <h2 id="invoice-table-heading">Invoices</h2>
      <table>
        <caption>
          {invoices.length} invoices — total:{" "}
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
            totalAmount,
          )}
        </caption>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Status</th>
            <th scope="col">Amount</th>
            <th scope="col">Due Date</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ─── Sub-component ─────────────────────────────────────────────────────────────

interface InvoiceRowProps {
  invoice: Invoice;
  onRowClick: (id: string) => void;
}

function InvoiceRow({ invoice, onRowClick }: InvoiceRowProps) {
  return (
    <tr>
      <td>{invoice.title}</td>
      <td>{invoice.status}</td>
      <td>
        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
          invoice.amount,
        )}
      </td>
      <td>
        <time dateTime={invoice.dueDate.toISOString()}>
          {invoice.dueDate.toLocaleDateString()}
        </time>
      </td>
      <td>
        <button
          type="button"
          onClick={() => onRowClick(invoice.id)}
          aria-label={`View invoice: ${invoice.title}`}
        >
          View
        </button>
      </td>
    </tr>
  );
}
