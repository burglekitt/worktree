/**
 * BAD: Syncing derived values into state with useEffect
 *
 * Problems:
 * - `filtered` and `total` are duplicate state — they can drift from `items`/`search`
 * - Extra render on every input change (state update → effect → state update → render)
 * - More code, more bugs, no benefit over computing during render
 * - Initial render shows stale values until the effect runs
 */

import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  price: number;
}

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
  const [search, setSearch] = useState("");
  // ✗ derived values stored as state
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);

  // ✗ effect syncs derived state — entirely unnecessary
  useEffect(() => {
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(result);
    setTotal(result.reduce((sum, item) => sum + item.price, 0));
  }, [items, search]);

  return (
    <section>
      <label>
        Search
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <p>
        {filtered.length} items — total ${total.toFixed(2)}
      </p>
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>
            {item.name} — ${item.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  );
}
