<script setup lang="ts">
import * as z from 'zod'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const loadingPassword = ref(false)
const loadingDelete = ref(false)

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: '',
  new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

// Submit ganti password ke API C#
async function onSubmitPassword(event: FormSubmitEvent<PasswordSchema>) {
  loadingPassword.value = true
  try {
    await $fetch('/api/v1/settings/change-password', {
      method: 'POST',
      body: {
        currentPassword: event.data.current,
        newPassword: event.data.new
      }
    })

    toast.add({
      title: 'Success',
      description: 'Password has been updated successfully.',
      color: 'success'
    })

    // Reset form
    password.current = ''
    password.new = ''
  } catch (err: any) {
    const message = err?.data?.message || err?.data?.statusMessage
    toast.add({
      title: 'Error',
      description: message || 'Failed to update password.',
      color: 'error'
    })
  } finally {
    loadingPassword.value = false
  }
}

// Hapus akun via API C#
async function onDeleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }

  loadingDelete.value = true
  try {
    await $fetch('/api/v1/settings/delete-account', {
      method: 'DELETE'
    })

    toast.add({
      title: 'Account Deleted',
      description: 'Your account has been permanently removed.',
      color: 'success'
    })

    // Redirect ke halaman login setelah akun dihapus
    await navigateTo('/login')
  } catch (err: any) {
    const message = err?.data?.message || err?.data?.statusMessage
    toast.add({
      title: 'Error',
      description: message || 'Failed to delete account.',
      color: 'error'
    })
  } finally {
    loadingDelete.value = false
  }
}

// --- Guardian: sesi aktif & riwayat aktivitas login ---
interface ActiveSession {
  id: string
  deviceName: string
  operatingSystem: string
  browser: string
  ipAddress: string
  country: string
  isCurrent: boolean
  lastActivityAt: string
}

interface LoginActivity {
  id: string
  activityType: string
  device: string
  operatingSystem: string
  browser: string
  ipAddress: string
  country: string
  isSuccess: boolean
  createdAt: string
}

interface GuardianDashboard {
  securityStatus: {
    statusLevel: string
    activeSessionsCount: number
    failedAttemptsLast24Hours: number
    lastSuccessfulLogin: string | null
  }
  recentActivities: LoginActivity[]
  activeSessions: ActiveSession[]
}

const { data: guardianResponse, pending: loadingGuardian, refresh: fetchGuardianDashboard } = await useAsyncData(
  'guardian-dashboard',
  () => {
    const headers = import.meta.server
      ? (useRequestHeaders(['cookie']) as Record<string, string>)
      : {}
    return $fetch<{ success: boolean; data: GuardianDashboard }>('/api/v1/settings/guardian/dashboard', { headers })
  }
)

const guardian = computed(() => guardianResponse.value?.data || null)

async function revokeSession(sessionId: string) {
  try {
    await $fetch(`/api/v1/settings/guardian/revoke-session/${sessionId}`, { method: 'POST' })
    toast.add({ title: 'Success', description: 'Sesi berhasil dicabut.', color: 'success' })
    await fetchGuardianDashboard()
  } catch {
    toast.add({ title: 'Error', description: 'Gagal mencabut sesi.', color: 'error' })
  }
}

async function revokeAllSessions() {
  try {
    await $fetch('/api/v1/settings/guardian/revoke-all-sessions', { method: 'POST' })
    toast.add({ title: 'Success', description: 'Semua sesi lain berhasil dicabut.', color: 'success' })
    await fetchGuardianDashboard()
  } catch {
    toast.add({ title: 'Error', description: 'Gagal mencabut semua sesi.', color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div>
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Password
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Confirm your current password before setting a new one.
          </p>
        </div>
      </template>

      <UForm
        :schema="passwordSchema"
        :state="password"
        :validate="validate"
        class="flex flex-col gap-4 max-w-xs"
        @submit="onSubmitPassword"
      >
        <UFormField label="Current Password" name="current">
          <UInput
            v-model="password.current"
            type="password"
            placeholder="Current password"
            class="w-full"
          />
        </UFormField>

        <UFormField label="New Password" name="new">
          <UInput
            v-model="password.new"
            type="password"
            placeholder="New password"
            class="w-full"
          />
        </UFormField>

        <UButton
          label="Update Password"
          class="w-fit"
          type="submit"
          :loading="loadingPassword"
        />
      </UForm>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Guardian
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sesi aktif dan riwayat aktivitas login akun Anda.
            </p>
          </div>
          <UButton
            v-if="guardian?.activeSessions?.length && guardian.activeSessions.length > 1"
            label="Cabut Semua Sesi Lain"
            color="error"
            variant="soft"
            size="sm"
            @click="revokeAllSessions"
          />
        </div>
      </template>

      <div v-if="loadingGuardian" class="text-sm text-gray-500 dark:text-gray-400 py-2">
        Memuat data keamanan...
      </div>

      <template v-else-if="guardian">
        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Status Keamanan
              </p>
              <p
                class="font-semibold"
                :class="guardian.securityStatus.statusLevel === 'Warning' ? 'text-red-500' : 'text-emerald-500'"
              >
                {{ guardian.securityStatus.statusLevel }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Percobaan Gagal (24 Jam)
              </p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ guardian.securityStatus.failedAttemptsLast24Hours }} kali
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Login Berhasil Terakhir
              </p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ guardian.securityStatus.lastSuccessfulLogin ? new Date(guardian.securityStatus.lastSuccessfulLogin).toLocaleString('id-ID') : '-' }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium mb-3 text-gray-900 dark:text-white">
              Sesi Aktif
            </p>
            <div class="space-y-2">
              <div
                v-for="session in guardian.activeSessions"
                :key="session.id"
                class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <div class="text-sm">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ session.deviceName }} — {{ session.browser }} ({{ session.operatingSystem }})
                    <UBadge
                      v-if="session.isCurrent"
                      color="success"
                      variant="subtle"
                      size="sm"
                      class="ms-1"
                    >
                      Perangkat Ini
                    </UBadge>
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ session.ipAddress }} • {{ session.country }}
                  </p>
                </div>
                <UButton
                  v-if="!session.isCurrent"
                  label="Cabut"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="revokeSession(session.id)"
                />
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium mb-3 text-gray-900 dark:text-white">
              Aktivitas Terakhir
            </p>
            <div class="space-y-1">
              <div
                v-for="activity in guardian.recentActivities"
                :key="activity.id"
                class="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ activity.activityType }} ({{ activity.browser }} / {{ activity.operatingSystem }})
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ new Date(activity.createdAt).toLocaleString('id-ID') }} • {{ activity.ipAddress }}
                  </p>
                </div>
                <UBadge :color="activity.isSuccess ? 'success' : 'error'" variant="subtle" size="sm">
                  {{ activity.isSuccess ? 'Sukses' : 'Gagal' }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <UCard class="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10">
      <template #header>
        <div>
          <h3 class="text-base font-semibold leading-6 text-red-600 dark:text-red-400">
            Delete Account
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently.
          </p>
        </div>
      </template>

      <template #footer>
        <UButton
          label="Delete account"
          color="error"
          :loading="loadingDelete"
          @click="onDeleteAccount"
        />
      </template>
    </UCard>
  </div>
</template>