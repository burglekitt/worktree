import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";
import type { ReactNode } from "react";
import { Chat } from "../chat/components/Chat";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import "../styles/globals.css";

export { metadata } from "../lib/site-meta";

function DeprecationBanner() {
  return (
    <div
      style={{
        backgroundColor: "#fff3cd",
        borderBottom: "1px solid #ffc107",
        color: "#856404",
        padding: "0.75rem 1.5rem",
        textAlign: "center",
        fontWeight: 500,
        fontSize: "0.95rem",
      }}
    >
      ⚠️ This package has moved to{" "}
      <code
        style={{
          backgroundColor: "#856404",
          color: "#fff",
          padding: "0.15rem 0.4rem",
          borderRadius: "0.25rem",
          fontFamily: "monospace",
        }}
      >
        @northguild/worktree
      </code>
      . Future development continues under{" "}
      <code
        style={{
          backgroundColor: "#856404",
          color: "#fff",
          padding: "0.15rem 0.4rem",
          borderRadius: "0.25rem",
          fontFamily: "monospace",
        }}
      >
        @northguild/worktree
      </code>
      . Install with:{" "}
      <code
        style={{
          backgroundColor: "#856404",
          color: "#fff",
          padding: "0.15rem 0.4rem",
          borderRadius: "0.25rem",
          fontFamily: "monospace",
        }}
      >
        npm install -g @northguild/worktree
      </code>
    </div>
  );
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Chat />
        <DeprecationBanner />
        <Layout
          themeSwitch={{
            dark: "Dark",
            light: "Light",
            system: "System",
          }}
          navbar={<Navbar />}
          pageMap={await getPageMap()}
          footer={<Footer />}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
