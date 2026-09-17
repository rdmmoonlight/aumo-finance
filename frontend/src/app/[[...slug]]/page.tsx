// src/app/[[...slug]]/page.tsx
'use client'

import dynamic from 'next/dynamic'

// Impor komponen utama TanStack Router KHUSUS di browser (matikan SSR)
const ClientApp = dynamic(() => import('./client-app'), {
  ssr: false,
})

export default function Page() {
  return <ClientApp />
}
