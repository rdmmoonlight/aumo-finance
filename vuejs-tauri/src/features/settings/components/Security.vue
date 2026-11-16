<script setup lang="ts">
import { ref } from 'vue';
import { useChangePasswordMutation } from '../api/settings.api';
import SecurityTables from './SecurityTables.vue';

defineOptions({ name: 'SecuritySettings' })

// Local state form & feedback
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const twoFactorEnabled = ref(false)
const logs = ref([])
const loading = ref(false)

function toggleTwoFactor() {
    twoFactorEnabled.value = !twoFactorEnabled.value
}

// Form ganti password
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Mutation dari TanStack Query
const changePasswordMutation = useChangePasswordMutation()

async function handlePasswordChange() {
    errorMessage.value = ''
    successMessage.value = ''

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        errorMessage.value = 'Konfirmasi kata sandi baru tidak cocok.'
        return
    }

    saving.value = true

    try {
        await changePasswordMutation.mutateAsync({
            currentPassword: passwordForm.value.currentPassword,
            newPassword: passwordForm.value.newPassword
        })

        successMessage.value = 'Kata sandi berhasil diperbarui.'
        passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } catch (err: unknown) {
        const error = err !== null && typeof err === 'object'
            ? err as { message?: unknown; detail?: unknown }
            : undefined
        errorMessage.value = (typeof error?.message === 'string' && error.message)
            || (typeof error?.detail === 'string' && error.detail)
            || 'Gagal mengubah kata sandi.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="space-y-8 max-w-4xl">
        <!-- Header -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Keamanan & Keautentikan</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Kelola kredensial kata sandi dan proteksi autentikasi dua faktor.
            </p>
        </div>

        <!-- Alert Messages -->
        <div v-if="errorMessage" class="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
            {{ successMessage }}
        </div>

        <!-- Change Password Form -->
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">Ubah Kata Sandi</h4>

            <div class="space-y-1">
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kata Sandi Saat Ini
                </label>
                <input id="currentPassword" v-model="passwordForm.currentPassword" type="password" required
                    class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kata Sandi Baru
                    </label>
                    <input id="newPassword" v-model="passwordForm.newPassword" type="password" required
                        class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="space-y-1">
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Konfirmasi Kata Sandi Baru
                    </label>
                    <input id="confirmPassword" v-model="passwordForm.confirmPassword" type="password" required
                        class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <div class="pt-2">
                <button type="submit" :disabled="saving"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {{ saving ? 'Memperbarui...' : 'Perbarui Kata Sandi' }}
                </button>
            </div>
        </form>

        <hr class="border-gray-200 dark:border-gray-700" />

        <!-- Two-Factor Authentication -->
        <div class="flex items-center justify-between">
            <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">Autentikasi Dua Faktor (2FA)</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Tambahkan lapisan keamanan ekstra saat masuk ke akun kamu.
                </p>
            </div>
            <button type="button" @click="toggleTwoFactor" :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                twoFactorEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-600 text-white hover:bg-green-700'
            ]">
                {{ twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA' }}
            </button>
        </div>

        <hr class="border-gray-200 dark:border-gray-700" />

        <!-- Audit Logs Section -->
        <div class="space-y-4">
            <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">Log Aktivitas Keamanan</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Catatan riwayat masuk dan aktivitas penting pada akun kamu.
                </p>
            </div>

            <SecurityTables :logs="logs" :loading="loading" />
        </div>
    </div>
</template>