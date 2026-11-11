import { onMounted, ref } from 'vue'

export interface AccountOption {
  id: string
  code: string
  name: string
}

export function useAvailableAccounts() {
  const accounts = ref<AccountOption[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAccounts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch('/api/chart-of-accounts')
      if (!response.ok) throw new Error('Gagal mengambil daftar akun')
      const data = await response.json()
      accounts.value = data.map((acc: any) => ({
        id: acc.id,
        code: acc.code,
        name: acc.name,
      }))
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat akun'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchAccounts()
  })

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
  }
}
