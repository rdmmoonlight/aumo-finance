'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export { useRouter, usePathname, useSearchParams }

export function useCompatRouter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSearchParams = (next: Record<string, string> | URLSearchParams) => {
    const params = new URLSearchParams(next as any)
    router.push(`${pathname}?${params.toString()}`)
  }

  return [searchParams, setSearchParams] as const
}

export default useCompatRouter
