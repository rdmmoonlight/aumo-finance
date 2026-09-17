import type { Metadata } from 'next'
import '@/styles/index.css'

export const metadata: Metadata = {
  title: 'Aumo Finance',
  description: 'Aplikasi Manajemen Keuangan Aumo Finance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
