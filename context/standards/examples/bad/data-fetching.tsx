/**
 * BAD: Manual data fetching with useEffect
 *
 * Problems:
 * - Race condition: if `userId` changes mid-fetch, the older response can overwrite the newer one
 * - No caching: every mount triggers a fetch
 * - No deduplication: two components mounting in parallel each fetch
 * - Error state has no handling
 * - No request cancellation on unmount
 * - State sprawl: 3 useState calls to track what TanStack Query gives for free
 */

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // ✗ no error state — failures are silently swallowed below

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        // ✗ if userId changed during this fetch, this overwrites the newer result
        setUser(data);
        setIsLoading(false);
      });
    // ✗ no .catch — network errors silently leave isLoading=true forever
    // ✗ no AbortController — cancelled fetches still fire setState on unmount
  }, [userId]);

  if (isLoading) return <div>Loading…</div>;
  if (!user) return null;

  return (
    <article>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </article>
  );
}
