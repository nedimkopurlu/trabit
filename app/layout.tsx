import type { Metadata } from "next";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";

export const metadata: Metadata = {
  title: "Trabit",
  description: "Alışkanlık takip PWA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
