import type { Metadata, Viewport } from 'next'
import '@/styles/index.css'

export const metadata: Metadata = {
  title: {
    default: 'Aumo Finance',
    template: '%s | Aumo Finance',
  },
  description: 'Aplikasi Manajemen Keuangan Aumo Finance',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        {children}
      </body>
    </html>
  )
}
