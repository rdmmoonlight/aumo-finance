<script setup lang="ts">

export interface AccountSession {
    id: string
    device: string
    location: string
    lastActive: string
    isCurrent: boolean
}

// Props
const props = withDefaults(
    defineProps<{
        sessions?: AccountSession[]
        loading?: boolean
    }>(),
    {
        sessions: () => [],
        loading: false
    }
)

// Emits
const emit = defineEmits<{
    (e: 'revoke', id: string): void
}>()

function handleRevoke(id: string) {
    emit('revoke', id)
}
</script>

<template>
    <div class="account-table-wrapper overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
            <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700 font-medium text-gray-500">
                    <th class="py-3 px-4">Perangkat</th>
                    <th class="py-3 px-4">Lokasi</th>
                    <th class="py-3 px-4">Terakhir Aktif</th>
                    <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <!-- Loading State -->
                <tr v-if="loading">
                    <td colspan="4" class="py-6 text-center text-gray-400">
                        Memuat data sesi...
                    </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="props.sessions.length === 0">
                    <td colspan="4" class="py-6 text-center text-gray-400">
                        Tidak ada sesi aktif.
                    </td>
                </tr>

                <!-- Data Rows -->
                <tr v-else v-for="session in props.sessions" :key="session.id"
                    class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td class="py-3 px-4 font-medium">
                        <div class="flex items-center gap-2">
                            <span>{{ session.device }}</span>
                            <span v-if="session.isCurrent"
                                class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                Sesi Ini
                            </span>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {{ session.location }}
                    </td>
                    <td class="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {{ session.lastActive }}
                    </td>
                    <td class="py-3 px-4 text-right">
                        <button v-if="!session.isCurrent" @click="handleRevoke(session.id)"
                            class="text-xs font-medium text-red-600 hover:text-red-700 hover:underline">
                            Keluarkan
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>