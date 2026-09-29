import type { Metadata, Viewport } from "next";
import { cacheLife } from 'next/cache'
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/redux-provider";
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
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout(
   'use cache'
  cacheLife('hours')
{
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground text-sm antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReduxProvider>{children}</ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
