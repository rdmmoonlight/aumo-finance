<script setup lang="ts">
export interface SecurityLog {
    id: string
    event: string
    ipAddress: string
    timestamp: string
    status: 'success' | 'failed'
}

const props = withDefaults(
    defineProps<{
        logs?: SecurityLog[]
        loading?: boolean
    }>(),
    {
        logs: () => [],
        loading: false
    }
)
</script>

<template>
    <div class="security-tables-wrapper overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
            <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 font-medium text-gray-500">
                    <th class="py-3 px-4">Aktivitas</th>
                    <th class="py-3 px-4">Alamat IP</th>
                    <th class="py-3 px-4">Waktu</th>
                    <th class="py-3 px-4 text-right">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <!-- Loading State -->
                <tr v-if="props.loading">
                    <td colspan="4" class="py-6 text-center text-gray-400">
                        Memuat riwayat keamanan...
                    </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="props.logs.length === 0">
                    <td colspan="4" class="py-6 text-center text-gray-400">
                        Tidak ada riwayat aktivitas keamanan.
                    </td>
                </tr>

                <!-- Log Rows -->
                <tr v-else v-for="log in props.logs" :key="log.id"
                    class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {{ log.event }}
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {{ log.ipAddress }}
                    </td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {{ log.timestamp }}
                    </td>
                    <td class="py-3 px-4 text-right">
                        <span :class="[
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            log.status === 'success'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        ]">
                            {{ log.status === 'success' ? 'Berhasil' : 'Gagal' }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>