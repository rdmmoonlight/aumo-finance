// src/lib/query-client.ts
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type { App } from 'vue'

// Pemetaan dari baseApi lama (RTK Query):
// refetchOnFocus: false        -> refetchOnWindowFocus: false
// refetchOnReconnect: false    -> refetchOnReconnect: false
// refetchOnMountOrArgChange: false -> refetchOnMount: false
// keepUnusedDataFor: 300 (detik) -> gcTime: 300_000
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
        },
        mutations: {
            retry: 0,
        },
    },
})

// Plugin siap pakai di main.ts
export function createVueQueryPlugin() {
    return {
        install(app: App) {
            app.use(VueQueryPlugin, { queryClient })
        },
    }
}

export { VueQueryPlugin }
export default createVueQueryPlugin