<script setup lang="ts">
import { ref } from 'vue'
import Account from './components/Account.vue'
import Appearance from './components/Appearance.vue'
import Security from './components/Security.vue'

type TabKey = 'account' | 'appearance' | 'security'

const activeTab = ref<TabKey>('account')

const tabs = [
    { key: 'account', label: 'Akun' },
    { key: 'appearance', label: 'Tampilan' },
    { key: 'security', label: 'Keamanan' }
] as const

function setTab(key: TabKey) {
    activeTab.value = key
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
        <div class="max-w-6xl mx-auto space-y-6">
            <!-- Title -->
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Pengaturan</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Kelola preferensi akun, tampilan antarmuka, dan keamanan sistem kamu.
                </p>
            </div>

            <!-- Main Layout: Sidebar Tab + Content -->
            <div class="flex flex-col md:flex-row gap-6 items-start">
                <!-- Tab Navigation -->
                <nav
                    class="w-full md:w-64 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pb-4 md:pb-0 md:pr-4 shrink-0">
                    <button v-for="tab in tabs" :key="tab.key" type="button" @click="setTab(tab.key)" :class="[
                        'px-4 py-2 text-sm font-medium rounded-md text-left transition-colors',
                        activeTab === tab.key
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    ]">
                        {{ tab.label }}
                    </button>
                </nav>

                <!-- Dynamic Content View -->
                <main
                    class="flex-1 w-full bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm">
                    <KeepAlive>
                        <Account v-if="activeTab === 'account'" />
                        <Appearance v-else-if="activeTab === 'appearance'" />
                        <Security v-else-if="activeTab === 'security'" />
                    </KeepAlive>
                </main>
            </div>
        </div>
    </div>
</template>