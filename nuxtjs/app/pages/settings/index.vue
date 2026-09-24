<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

const dashboard = ref<GuardianDashboard | null>(null)
const loading = ref(false)
const toast = useToast()

// Fetch data dari Controller
async function fetchDashboard() {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: GuardianDashboard }>('/api/v1/settings/guardian/dashboard')
    if (response.success) {
      dashboard.value = response.data
    }
  } catch (err) {
    toast.add({ title: 'Error', description: 'Gagal mengambil data keamanan', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Revoke Single Session
async function revokeSession(sessionId: string) {
  try {
    await $fetch(`/api/v1/settings/guardian/revoke-session/${sessionId}`, { method: 'POST' })
    toast.add({ title: 'Success', description: 'Sesi berhasil dicabut', color: 'success' })
    await fetchDashboard()
  } catch (err) {
    toast.add({ title: 'Error', description: 'Gagal mencabut sesi', color: 'error' })
  }
}

// Revoke All Other Sessions
async function revokeAllSessions() {
  try {
    await $fetch('/api/v1/settings/guardian/revoke-all-sessions', { method: 'POST' })
    toast.add({ title: 'Success', description: 'Semua sesi lain berhasil dicabut', color: 'success' })
    await fetchDashboard()
  } catch (err) {
    toast.add({ title: 'Error', description: 'Gagal mencabut semua sesi', color: 'error' })
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div v-if="loading" class="p-4">Memuat data keamanan...</div>

  <div v-else-if="dashboard" class="space-y-6">
    <UPageCard
      title="Guardian Security"
      description="Pantau sesi aktif dan riwayat aktivitas login akun Anda."
      variant="naked"
      orientation="horizontal"
    >
      <UButton
        label="Cabut Semua Sesi Lain"
        color="error"
        class="w-fit lg:ms-auto"
        @click="revokeAllSessions"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
        <div>
          <p class="text-xs text-gray-500">Status Keamanan</p>
          <p class="font-semibold" :class="dashboard.securityStatus.statusLevel === 'Warning' ? 'text-red-500' : 'text-green-500'">
            {{ dashboard.securityStatus.statusLevel }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Percobaan Gagal (24 Jam)</p>
          <p class="font-semibold">{{ dashboard.securityStatus.failedAttemptsLast24Hours }} kali</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Login Berhasil Terakhir</p>
          <p class="font-semibold">
            {{ dashboard.securityStatus.lastSuccessfulLogin ? new Date(dashboard.securityStatus.lastSuccessfulLogin).toLocaleString() : '-' }}
          </p>
        </div>
      </div>
    </UPageCard>

    <UPageCard variant="subtle" title="Sesi Aktif">
      <div class="space-y-4 mt-2">
        <div 
          v-for="session in dashboard.activeSessions" 
          :key="session.id" 
          class="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <p class="font-medium">
              {{ session.deviceName }} — {{ session.browser }} ({{ session.operatingSystem }})
              <span v-if="session.isCurrent" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">Perangkat Ini</span>
            </p>
            <p class="text-xs text-gray-500">{{ session.ipAddress }} • {{ session.country }}</p>
          </div>
          <UButton
            v-if="!session.isCurrent"
            label="Cabut"
            color="neutral"
            size="sm"
            @click="revokeSession(session.id)"
          />
        </div>
      </div>
    </UPageCard>

    <UPageCard variant="subtle" title="Aktivitas Terakhir">
      <div class="space-y-3 mt-2">
        <div 
          v-for="activity in dashboard.recentActivities" 
          :key="activity.id" 
          class="flex items-center justify-between text-sm py-2 border-b last:border-0"
        >
          <div>
            <p class="font-medium">{{ activity.activityType }} ({{ activity.browser }} / {{ activity.operatingSystem }})</p>
            <p class="text-xs text-gray-400">{{ new Date(activity.createdAt).toLocaleString() }} • {{ activity.ipAddress }}</p>
          </div>
          <span 
            class="text-xs font-semibold px-2 py-1 rounded"
            :class="activity.isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ activity.isSuccess ? 'Sukses' : 'Gagal' }}
          </span>
        </div>
      </div>
    </UPageCard>
  </div>
</template>