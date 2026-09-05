/**
 * GOOD: Context provides user data where it's actually needed
 *
 * - Intermediate components carry no extra props
 * - Adding new shared data doesn't require updating every layer
 * - Tree is composed declaratively at the top
 */

import { createContext, useContext, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
}

interface UserContextValue {
  user: User;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  user: User;
  children: ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

function useCurrentUser(): User {
  const context = useContext(UserContext);
  if (!context) throw new Error("useCurrentUser must be used within UserProvider");
  return context.user;
}

// ─── Components — no `user` prop forwarded through the tree ───────────────────

interface PageProps {
  user: User;
}

export function Page({ user }: PageProps) {
  return (
    <UserProvider user={user}>
      <Layout />
    </UserProvider>
  );
}

function Layout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Content />
    </div>
  );
}

function Sidebar() {
  return (
    <aside>
      <Nav />
      <UserMenu />
    </aside>
  );
}

function UserMenu() {
  const user = useCurrentUser();
  return <button type="button">{user.name}</button>;
}

function Header() {
  return <header />;
}
function Content() {
  return <main />;
}
function Nav() {
  return <nav />;
}
