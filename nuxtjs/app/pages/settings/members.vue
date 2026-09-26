<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface UserProfile {
  userId: string
  email: string
  userName: string
  fullName: string
  roles: string[]
}

const members = ref<UserProfile[]>([])
const loading = ref(false)
const q = ref('')
const toast = useToast()

// Ambil data profil pengguna yang sedang login dari endpoint AuthController: GET /api/v1/auth/me
async function fetchCurrentMember() {
  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      userId: string
      email: string
      userName: string
      fullName: string
      roles: string[]
    }>('/api/v1/auth/me')

    if (response.success) {
      members.value = [
        {
          userId: response.userId,
          email: response.email,
          userName: response.userName,
          fullName: response.fullName,
          roles: response.roles
        }
      ]
    }
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
  fetchCurrentMember()
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

      <div v-if="loading" class="p-4 text-sm text-gray-500">
        Memuat data...
      </div>

      <!-- Menampilkan daftar member yang sudah terintegrasi dengan struktur AuthController -->
      <SettingsMembersList v-else :members="filteredMembers" />
    </UPageCard>
  </div>
</template>
