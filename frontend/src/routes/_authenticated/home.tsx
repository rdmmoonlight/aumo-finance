// src/routes/_authenticated/homepage.tsx
import { createFileRoute } from '@tanstack/react-router'
import HomePage from '@/pages/Home' // Mengambil UI dari src/pages/HomePage.tsx

export const Route = createFileRoute('/_authenticated/home')({
  ssr: false, // Menjaga stabilitas render di client
  component: HomePage,
})