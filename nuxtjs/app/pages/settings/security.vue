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
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
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
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
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
// (dipindahkan dari settings/index.vue supaya satu halaman dengan
// Password/Account - lebih cocok secara konten daripada di General)
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

const guardian = ref<GuardianDashboard | null>(null)
const loadingGuardian = ref(false)

async function fetchGuardianDashboard() {
  loadingGuardian.value = true
  try {
    const response = await $fetch<{ success: boolean, data: GuardianDashboard }>('/api/v1/settings/guardian/dashboard')
    if (response.success) {
      guardian.value = response.data
    }
  } catch {
    toast.add({ title: 'Error', description: 'Gagal mengambil data keamanan.', color: 'error' })
  } finally {
    loadingGuardian.value = false
  }
}

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

onMounted(() => {
  fetchGuardianDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <UPageCard
      title="Password"
      description="Confirm your current password before setting a new one."
      variant="subtle"
    >
      <UForm
        :schema="passwordSchema"
        :state="password"
        :validate="validate"
        class="flex flex-col gap-4 max-w-xs"
        @submit="onSubmitPassword"
      >
        <UFormField name="current">
          <UInput
            v-model="password.current"
            type="password"
            placeholder="Current password"
            class="w-full"
          />
        </UFormField>

        <UFormField name="new">
          <UInput
            v-model="password.new"
            type="password"
            placeholder="New password"
            class="w-full"
          />
        </UFormField>

        <UButton
          label="Update"
          class="w-fit"
          type="submit"
          :loading="loadingPassword"
        />
      </UForm>
    </UPageCard>

    <UPageCard
      title="Guardian"
      description="Sesi aktif dan riwayat aktivitas login akun Anda."
      variant="subtle"
      :ui="{ container: 'gap-4' }"
    >
      <template #footer>
        <UButton
          v-if="guardian?.activeSessions?.length"
          label="Cabut Semua Sesi Lain"
          color="error"
          variant="soft"
          size="sm"
          @click="revokeAllSessions"
        />
      </template>

      <div v-if="loadingGuardian && !guardian" class="text-sm text-muted py-2">
        Memuat data keamanan...
      </div>

      <template v-else-if="guardian">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-muted">
              Status Keamanan
            </p>
            <p class="font-semibold" :class="guardian.securityStatus.statusLevel === 'Warning' ? 'text-error' : 'text-success'">
              {{ guardian.securityStatus.statusLevel }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted">
              Percobaan Gagal (24 Jam)
            </p>
            <p class="font-semibold">
              {{ guardian.securityStatus.failedAttemptsLast24Hours }} kali
            </p>
          </div>
          <div>
            <p class="text-xs text-muted">
              Login Berhasil Terakhir
            </p>
            <p class="font-semibold">
              {{ guardian.securityStatus.lastSuccessfulLogin ? new Date(guardian.securityStatus.lastSuccessfulLogin).toLocaleString() : '-' }}
            </p>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium mb-2">
            Sesi Aktif
          </p>
          <div class="space-y-2">
            <div
              v-for="session in guardian.activeSessions"
              :key="session.id"
              class="flex items-center justify-between p-3 border border-default rounded-lg"
            >
              <div class="text-sm">
                <p class="font-medium">
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
                <p class="text-xs text-muted">
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
          <p class="text-sm font-medium mb-2">
            Aktivitas Terakhir
          </p>
          <div class="space-y-1">
            <div
              v-for="activity in guardian.recentActivities"
              :key="activity.id"
              class="flex items-center justify-between text-sm py-2 border-b border-default last:border-0"
            >
              <div>
                <p class="font-medium">
                  {{ activity.activityType }} ({{ activity.browser }} / {{ activity.operatingSystem }})
                </p>
                <p class="text-xs text-muted">
                  {{ new Date(activity.createdAt).toLocaleString() }} • {{ activity.ipAddress }}
                </p>
              </div>
              <UBadge :color="activity.isSuccess ? 'success' : 'error'" variant="subtle" size="sm">
                {{ activity.isSuccess ? 'Sukses' : 'Gagal' }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>
    </UPageCard>

    <UPageCard
      title="Account"
      description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
      class="bg-linear-to-tl from-error/10 from-5% to-default"
    >
      <template #footer>
        <UButton
          label="Delete account"
          color="error"
          :loading="loadingDelete"
          @click="onDeleteAccount"
        />
      </template>
    </UPageCard>
  </div>
</template>
