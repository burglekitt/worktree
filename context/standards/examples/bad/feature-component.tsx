/**
 * BAD EXAMPLE: God component with multiple anti-patterns
 *
 * Anti-patterns demonstrated:
 * - useEffect for data fetching (use TanStack Query instead)
 * - useEffect for derived state (compute during render instead)
 * - Giant single component (decompose instead)
 * - No types / implicit any
 * - No error handling
 * - No loading state
 * - No accessibility (clickable div, no labels, no semantic markup)
 * - Index as key
 * - Unhandled promise (missing await / .catch)
 * - Defensive unnecessary memoization
 */

import { useEffect, useMemo, useState } from "react";

// ✗ No types defined — all data is implicitly any

export default function Invoices() {
  // ✗ Manual fetch state instead of TanStack Query
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✗ useEffect for data fetching — race conditions, no caching, no deduplication
  useEffect(() => {
    setLoading(true);
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        // ✗ No error handling — silently fails on network errors
      });
  }, []);

  // ✗ useEffect for derived state — should be computed during render
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (data) {
      // @ts-ignore
      setTotal(data.reduce((sum, inv) => sum + inv.amount, 0));
    }
  }, [data]);

  // ✗ Defensive memoization of a trivial computation
  const label = useMemo(() => `Total: $${total}`, [total]);

  // ✗ No loading state rendered to user
  if (loading) return null;

  return (
    // ✗ No semantic markup — div soup
    <div>
      <div>{label}</div>
      <div>
        {/* ✗ Index as key — unstable, causes rendering bugs */}
        {/* ✗ any type throughout */}
        {(data as any)?.map((invoice: any, i: number) => (
          <div
            key={i}
            // ✗ Clickable div — not keyboard accessible, not a button
            onClick={() => window.location.href = `/invoices/${invoice.id}`}
            style={{ cursor: "pointer" }}
          >
            {/* ✗ No accessible label, no semantic structure */}
            <span>{invoice.title}</span>
            <span>{invoice.status}</span>
            <span>{invoice.amount}</span>
            {/* ✗ Unhandled promise — fire and forget without .catch */}
            <span onClick={() => fetch(`/api/invoices/${invoice.id}/archive`, { method: "POST" })}>
              Archive
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
