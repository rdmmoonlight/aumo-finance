<script setup lang="ts">
import type { AuthUser } from '~/composables/useAuth'

const { user, checked, fetchAuthUser } = useAuth()
const q = ref('')
const loading = ref(false)
const toast = useToast()

// Ambil profil jika belum diambil oleh middleware/SSR
async function loadData() {
  if (!checked.value) {
    loading.value = true
    try {
      await fetchAuthUser()
    } catch {
      toast.add({
        title: 'Error',
        description: 'Gagal mengambil data anggota/profil.',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}

// Map user yang sedang login ke dalam array members
const members = computed<AuthUser[]>(() => {
  return user.value ? [user.value] : []
})

// Filter data berdasarkan kata kunci pencarian
const filteredMembers = computed(() => {
  if (!q.value) return members.value

  const query = q.value.toLowerCase()
  return members.value.filter((member) => {
    const nameMatch = member.fullName?.toLowerCase().includes(query)
    const usernameMatch = member.userName?.toLowerCase().includes(query)
    const emailMatch = member.email?.toLowerCase().includes(query)

    return nameMatch || usernameMatch || emailMatch
  })
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div>
    <UPageCard
      title="Account"
      description="Menampilkan profil akun yang sedang login. Fitur undang anggota tim belum tersedia di backend."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    />

    <UPageCard
      variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }"
    >
      <template #header>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search members"
          autofocus
          class="w-full"
        />
      </template>

      <div v-if="loading || !checked" class="p-4 text-sm text-gray-500">
        Memuat data...
      </div>

      <!-- Menampilkan daftar member yang sudah terintegrasi -->
      <SettingsMembersList v-else :members="filteredMembers" />
    </UPageCard>
  </div>
</template>