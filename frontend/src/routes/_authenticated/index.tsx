import { createFileRoute, redirect } from '@tanstack/react-router'
import HomePage from '../pages/HomePage'

export const Route = createFileRoute('/')({
  // Lempar otomatis ke /homepage jika route '/' hanya alias
  beforeLoad: () => {
    throw redirect({ to: '/homepage' })
  },
  component: HomePage,
})