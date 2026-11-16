// openapi-ts.config.ts
import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    // Sama dengan openapi-config.ts lama
    input: 'https://aumoweb.onrender.com/openapi/v1.json',
    output: 'src/lib/generated',
    plugins: [
        {
            name: '@hey-api/client-fetch',
            // Client fetch bawaan Hey API, baseUrl + credentials
            // diatur di src/lib/generated/client.ts setelah generate,
            // atau lewat createClient() di main.ts.
            // Default-nya pakai /api/v1 + credentials: 'include'
            // supaya sama dengan src/lib/api.ts
        },
        '@hey-api/typescript',
        {
            name: '@hey-api/sdk',
            transformer: true,
        },
        {
            name: '@tanstack/vue-query',
        },
    ],
})