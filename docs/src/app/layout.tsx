import Image from "next/image";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import type { ReactNode } from "react";
import { Footer } from "../components/Footer";
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
        <Image
          src="https://github.com/burglekitt.png?size=64"
          alt="Burglekitt"
          width={24}
          height={24}
          style={{ borderRadius: "999px" }}
        />
        Worktree
      </span>
    }
    projectLink="https://github.com/burglekitt/worktree"
  />
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
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          footer={<Footer />}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
