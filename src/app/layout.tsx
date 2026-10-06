import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Exchange",
  description: "Swap plants one-for-one with your neighbours.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
