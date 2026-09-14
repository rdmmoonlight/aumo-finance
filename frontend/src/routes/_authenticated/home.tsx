// src/routes/_authenticated/homepage.tsx
import { createFileRoute } from '@tanstack/react-router'
import HomePage from "@/pages/HomePage";

export const Route = createFileRoute('/_authenticated/home')({
  ssr: false, // Menjaga stabilitas render di client
  component: HomePage,
})
