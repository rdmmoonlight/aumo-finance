import type { Metadata } from 'next'
import '@/styles/index.css' // Import CSS global kamu (Tailwind v4 / PostCSS)

export const metadata: Metadata = {
  title: 'Aumo Finance',
  description: 'Aplikasi Manajemen Keuangan Aumo Finance',
  icons: {
    icon: '/favicon.ico?v=1',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
