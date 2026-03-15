import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import type { ReactNode } from "react";
import { cliVersion } from "../lib/site-version";
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
    logo={
      <span
        style={{
          alignItems: "center",
          display: "inline-flex",
          fontWeight: 700,
          gap: "0.5rem",
        }}
      >
        <img
          src="https://github.com/burglekitt.png?size=64"
          alt="Burglekitt"
          width="24"
          height="24"
          style={{ borderRadius: "999px" }}
        />
        Worktree
      </span>
    }
    projectLink="https://github.com/burglekitt/worktree"
  />
);

const footer = (
  <Footer>
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <div
        style={{ alignItems: "center", display: "inline-flex", gap: "0.5rem" }}
      >
        <img
          src="https://github.com/burglekitt.png?size=64"
          alt="Burglekitt"
          width="20"
          height="20"
          style={{ borderRadius: "999px" }}
        />
        <span>MIT {new Date().getFullYear()} © Burglekitt</span>
      </div>
      <div>CLI Version: v{cliVersion}</div>
      <div>
        Maintainers: <a href="https://github.com/craigcurtis">Craig Curtis</a>
        {" · "}
        <a href="https://github.com/burglekitt">Burglekitt</a>
      </div>
    </div>
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout navbar={navbar} pageMap={await getPageMap()} footer={footer}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
