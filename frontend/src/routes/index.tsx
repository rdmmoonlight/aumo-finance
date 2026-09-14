// src/routes/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Otomatis arahkan traffic dari '/' ke '/home' atau '/dashboard'
    throw redirect({ to: '/home' })
  },
})
