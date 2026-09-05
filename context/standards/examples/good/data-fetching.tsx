/**
 * GOOD: Data fetching with TanStack Query
 *
 * - Caches, deduplicates, and refetches automatically
 * - Loading and error states are first-class
 * - No race conditions
 * - No useEffect / useState for fetch state
 */

import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);
  return response.json();
}

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    staleTime: 60_000,
  });

  if (error) {
    return (
      <div role="alert">
        We couldn't load this profile. Please refresh and try again.
      </div>
    );
  }

  if (isLoading || !user) {
    return <div aria-busy="true">Loading…</div>;
  }

  return (
    <article>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </article>
  );
}
