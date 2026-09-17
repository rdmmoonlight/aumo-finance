// src/app/[[...slug]]/page.tsx
export const dynamic = 'force-dynamic'

import AppClient from './client-app'

export default function NextCatchAllPage() {
  return <AppClient />
}
