import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Aumo Finance",
    template: "%s | Aumo Finance",
  },
  description: "Aplikasi Keuangan Aumo Finance",
  icons: {
    icon: "/favicon.ico", // Path diperbaiki (tanpa prefix /public)
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}