#!/usr/bin/env bash

set -e

echo "=================================================="
echo "🛠️ MEMPERBAIKI IMPOR ROUTER KE NEXT/NAVIGATION"
echo "=================================================="

# 1. Update src/hooks/useCompatRouter.ts agar meng-export useRouter & useSearchParams
echo "📄 Memperbarui src/hooks/useCompatRouter.ts..."
cat << 'EOF' > src/hooks/useCompatRouter.ts
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
EOF

# 2. Alihkan semua impor useRouter & useSearchParams di src/app ke 'next/navigation'
echo "🔄 Mengganti impor di seluruh file src/app/ ke next/navigation..."
find src/app -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
  sed -i "s|import { useRouter, useSearchParams } from '@/hooks/useCompatRouter'|import { useRouter, useSearchParams } from 'next/navigation'|g" "$file" 2>/dev/null || true
  sed -i "s|import { useRouter } from '@/hooks/useCompatRouter'|import { useRouter } from 'next/navigation'|g" "$file" 2>/dev/null || true
  sed -i "s|import { useSearchParams } from '@/hooks/useCompatRouter'|import { useSearchParams } from 'next/navigation'|g" "$file" 2>/dev/null || true
done

echo "=================================================="
echo "✅ PERBAIKAN SELESAI! MENJALANKAN LOCAL BUILD..."
echo "=================================================="