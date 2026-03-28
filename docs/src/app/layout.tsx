import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";
import type { ReactNode } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { ChatFAB } from "./components/ChatFAB";

import "../styles/globals.css";

export { metadata } from "../lib/site-meta";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <ChatFAB />
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
