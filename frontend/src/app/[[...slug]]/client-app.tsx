// src/app/[[...slug]]/client-app.tsx
'use client'

import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '@/router'

// Inisialisasi router secara aman untuk client side
const router = getRouter()

export default function AppClient() {
  return <RouterProvider router={router} />
}
