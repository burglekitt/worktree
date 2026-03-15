import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import type { ReactNode } from "react";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: {
    default: "Worktree",
    template: "%s – Worktree",
  },
  description:
    "A CLI tool for managing Git worktrees with enhanced functionality.",
};

const navbar = (
  <Navbar
    logo={<b>Worktree</b>}
    projectLink="https://github.com/burglekitt/worktree"
  />
);

const footer = <Footer>MIT {new Date().getFullYear()} © Burglekitt.</Footer>;

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/burglekitt/worktree/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
