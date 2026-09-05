/**
 * GOOD: Derived values computed during render
 *
 * - One source of truth (items + search)
 * - No re-renders triggered by syncing state to state
 * - Fewer bugs: filtered/total are always in sync with inputs
 */

import { useState } from "react";

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

  // Computed during render — always in sync, no useEffect needed
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );
  const total = filtered.reduce((sum, item) => sum + item.price, 0);

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
