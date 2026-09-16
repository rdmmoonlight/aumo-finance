'use client'

import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '@/router' // Fungsi getRouter() kamu

const router = getRouter()

export default function NextCatchAllPage() {
  // TanStack Router mengambil alih seluruh render tampilan di sini
  return <RouterProvider router={router} />
}
