<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'SettingsAppearance' })

export type ThemeOption = 'light' | 'dark' | 'system'
export type FontSizeOption = 'small' | 'medium' | 'large'

export interface AppearanceSettings {
    theme: ThemeOption
    fontSize: FontSizeOption
}

const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const appearance = ref<AppearanceSettings>({
    theme: 'system',
    fontSize: 'medium',
})

async function saveSettings(updatedSettings: AppearanceSettings) {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        // TODO: Hubungkan ke store local / mutation API yang sesuai jika backend mendukung
        appearance.value = { ...updatedSettings }
        successMessage.value = 'Tampilan berhasil diperbarui.'
    } catch (err: unknown) {
        const error = err as Error
        errorMessage.value = error.message || 'Gagal menyimpan tampilan.'
    } finally {
        saving.value = false
    }
}

async function updateTheme(theme: ThemeOption) {
    await saveSettings({ ...appearance.value, theme })
}

async function updateFontSize(size: FontSizeOption) {
    await saveSettings({ ...appearance.value, fontSize: size })
}
</script>

<template>
    <div class="space-y-8 max-w-4xl">
        <!-- Header -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Tampilan</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Kustomisasi tema antarmuka dan ukuran teks aplikasi.
            </p>
        </div>

        <!-- Alert Messages -->
        <div v-if="errorMessage" class="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
            {{ successMessage }}
        </div>

        <!-- Theme Selection -->
        <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tema Aplikasi
            </label>
            <div class="grid grid-cols-3 gap-4">
                <!-- Light Theme Card -->
                <button type="button" @click="updateTheme('light')" :class="[
                    'p-4 border rounded-lg text-left transition-all flex flex-col justify-between',
                    appearance.theme === 'light'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]">
                    <div class="w-full h-12 rounded bg-gray-100 border border-gray-300 mb-2"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Terang</span>
                </button>

                <!-- Dark Theme Card -->
                <button type="button" @click="updateTheme('dark')" :class="[
                    'p-4 border rounded-lg text-left transition-all flex flex-col justify-between',
                    appearance.theme === 'dark'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]">
                    <div class="w-full h-12 rounded bg-gray-900 border border-gray-800 mb-2"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Gelap</span>
                </button>

                <!-- System Theme Card -->
                <button type="button" @click="updateTheme('system')" :class="[
                    'p-4 border rounded-lg text-left transition-all flex flex-col justify-between',
                    appearance.theme === 'system'
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                ]">
                    <div
                        class="w-full h-12 rounded bg-linear-to-r from-gray-100 to-gray-900 border border-gray-300 mb-2">
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Sistem</span>
                </button>
            </div>
        </div>

        <!-- Font Size Selection -->
        <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ukuran Font
            </label>
            <div class="flex gap-4">
                <button v-for="size in (['small', 'medium', 'large'] as const)" :key="size" type="button"
                    @click="updateFontSize(size)" :class="[
                        'px-4 py-2 border rounded-md text-sm font-medium capitalize transition-colors',
                        appearance.fontSize === size
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    ]">
                    {{ size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar' }}
                </button>
            </div>
        </div>
    </div>
</template>