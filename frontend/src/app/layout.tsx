import type { Metadata, Viewport } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  
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
              <main className="flex-1">{children}</main>

              {/* FOOTER */}
              <footer className="w-full border-t border-border/40 py-6">
                <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 md:flex-row">
                  <p className="text-sm text-muted-foreground">
                    © {currentYear} Aumo Finance. All rights reserved.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crafted with <span className="text-red-500">♥</span> by{" "}
                    <a
                      href="https://github.com/rdmmoonlight"
                      target="_blank"
                      className="font-semibold text-foreground hover:underline"
                    >
                      rdmmoonlight
                    </a>
                  </p>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
