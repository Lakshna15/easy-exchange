import type { Metadata } from "next";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Exchange",
  description: "Swap plants one-for-one with your neighbours.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main" className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
