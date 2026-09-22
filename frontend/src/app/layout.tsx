import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/redux-provider";
import { Inter } from "next/font/google";
import "@/styles/index.css";
import { Footer } from "@/components/app-footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
