/**
 * BAD: Drilling `user` through layers that never use it
 *
 * Problems:
 * - Layout and Sidebar accept `user` only to forward it — they don't render it
 * - Every intermediate signature grows when shared values are added
 * - Refactoring any layer ripples through the whole tree
 * - TypeScript noise: prop types repeated everywhere
 */

interface User {
  id: string;
  name: string;
}

interface PageProps {
  user: User;
}

export function Page({ user }: PageProps) {
  // ✗ Layout doesn't use `user` — only forwards it
  return <Layout user={user} />;
}

interface LayoutProps {
  user: User;
}

function Layout({ user }: LayoutProps) {
  return (
    <div>
      <Header />
      {/* ✗ Sidebar doesn't use `user` either — just forwards */}
      <Sidebar user={user} />
      <Content />
    </div>
  );
}

interface SidebarProps {
  user: User;
}

function Sidebar({ user }: SidebarProps) {
  return (
    <aside>
      <Nav />
      {/* Finally, UserMenu actually uses the prop */}
      <UserMenu user={user} />
    </aside>
  );
}

interface UserMenuProps {
  user: User;
}

function UserMenu({ user }: UserMenuProps) {
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
