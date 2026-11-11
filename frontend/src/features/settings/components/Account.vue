<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    useRevokeSessionByIdMutation,
    useUpdateProfileMutation,
    type UpdateProfileRequest,
} from '../api/settings.api';
import AccountTable, { type AccountSession } from './AccountTable.vue';

defineOptions({ name: 'AccountSettings' })

const errorMessage = ref('')
const successMessage = ref('')

const form = ref<UpdateProfileRequest>({
    userName: '',
    bio: '',
})

const sessions = ref<AccountSession[]>([
    { id: '1', device: 'Chrome / Windows', location: 'Surabaya, Indonesia', lastActive: 'Saat ini', isCurrent: true },
    { id: '2', device: 'Firefox / Android', location: 'Jombang, Indonesia', lastActive: '2 jam yang lalu', isCurrent: false },
])

const updateProfileMutation = useUpdateProfileMutation()
const revokeSessionMutation = useRevokeSessionByIdMutation()
const saving = computed(() => updateProfileMutation.isPending.value)
const loading = computed(() => saving.value || revokeSessionMutation.isPending.value)

function handleSubmit() {
    errorMessage.value = ''
    successMessage.value = ''

    updateProfileMutation.mutate(form.value, {
        onSuccess: () => {
            successMessage.value = 'Pengaturan akun berhasil disimpan.'
        },
        onError: (err: unknown) => {
            errorMessage.value = err instanceof Error ? err.message : 'Gagal memperbarui profil.'
        },
    })
}

function handleRevokeSession(sessionId: string) {
    errorMessage.value = ''
    revokeSessionMutation.mutate(
        { sessionId },
        {
            onSuccess: () => {
                sessions.value = sessions.value.filter((s) => s.id !== sessionId)
            },
            onError: (err: unknown) => {
                errorMessage.value = err instanceof Error ? err.message : 'Gagal mencabut sesi.'
            },
        }
    )
}
</script>

<template>
    <div class="space-y-8 max-w-4xl">
        <!-- Header -->
        <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Profil & Akun</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Kelola informasi identitas akun dan sesi login aktif kamu.
            </p>
        </div>

        <!-- Alert Messages -->
        <div v-if="errorMessage" class="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
            {{ successMessage }}
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-1">
                <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                </label>
                <input id="username" v-model="form.userName" type="text" :disabled="loading"
                    class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Masukkan username" />
            </div>

            <div class="space-y-1">
                <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio / Deskripsi
                </label>
                <textarea id="bio" v-model="form.bio" rows="3" :disabled="loading"
                    class="w-full px-3 py-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Tuliskan deskripsi singkat..."></textarea>
            </div>

            <div class="pt-2">
                <button type="submit" :disabled="saving || loading"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                    {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
            </div>
        </form>

        <hr class="border-gray-200 dark:border-gray-700" />

        <!-- Active Sessions Section -->
        <div class="space-y-4">
            <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">Sesi Aktif</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Daftar perangkat yang saat ini terhubung ke akun kamu.
                </p>
            </div>

            <AccountTable :sessions="sessions" :loading="loading" @revoke="handleRevokeSession" />
        </div>
    </div>
</template>