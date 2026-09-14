// src/routes/_authenticated/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  // Begitu buka '/', otomatis lempar ke '/homepage'
  beforeLoad: () => {
    throw redirect({ to: '/homepage' })
  },
})