import type { Metadata } from "next";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";

export const metadata: Metadata = {
  title: "Trabit",
  description: "Alışkanlık takip PWA",
  manifest: "/manifest.json",
  themeColor: "#0a0a0c",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Trabit",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
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
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <IOSInstallBanner />
      </body>
    </html>
  );
}
