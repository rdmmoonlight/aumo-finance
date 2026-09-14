// src/routes/_authenticated/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
// src/routes/_authenticated/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import HomePage from '@/pages/Home'

export const Route = createFileRoute('/_authenticated/')({
  component: Home,
})
