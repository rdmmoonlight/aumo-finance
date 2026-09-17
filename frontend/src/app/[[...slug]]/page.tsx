'use client'

export const dynamic = 'force-dynamic'

import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '@/router'

const router = getRouter()

export default function NextCatchAllPage() {
  return <RouterProvider router={router} />
}
