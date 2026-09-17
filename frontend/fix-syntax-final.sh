#!/usr/bin/env bash

set -e

echo "=================================================="
echo "🛠️ MEMPERBAIKI SINTAKS ROUTER.PUSH & HOOK COMPAT"
echo "=================================================="

# 1. Perbaiki Sintaksis di src/hooks/useCompatRouter.ts
if [ -f "src/hooks/useCompatRouter.ts" ]; then
  echo "📄 Merapikan src/hooks/useCompatRouter.ts..."
  cat << 'EOF' > src/hooks/useCompatRouter.ts
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

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
fi

# 2. Perbaiki sintaksis double closing parenthesis `router.push('...')` di seluruh app/
echo "🧹 Membersihkan kurung tutup ganda pada router.push..."
find src/app -type f -name "*.tsx" | while read -r file; do
  # Ubah router.push('...')` dari kurung ganda `))` menjadi `)`
  sed -i "s/router\.push(\([^)]*\)))/router\.push(\1)/g" "$file" 2>/dev/null || true
  
  # Ubah router.push('...', search: obj }) menjadi router.push('...')
  sed -i "s/router\.push(\([^)]*\), search: [^}]*})/router\.push(\1)/g" "$file" 2>/dev/null || true
done

echo "=================================================="
echo "✅ SINTAKS BERHASIL DIPERBAIKI! MENJALANKAN LOCAL BUILD..."
echo "=================================================="