import { onMounted, ref } from 'vue'
import { journalEntryApi, type JournalEntry } from '../api/journalEntryApi'

export function useJournalEntryDetail(id?: string) {
  const entry = ref<JournalEntry | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchDetail = async (entryId: string) => {
    isLoading.value = true
    error.value = null
    try {
      entry.value = await journalEntryApi.getJournalEntryById(entryId)
    } catch (err: any) {
      error.value = err.message || 'Gagal mengambil detail entri jurnal'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (id) {
      fetchDetail(id)
    }
  })

  return {
    entry,
    isLoading,
    error,
    fetchDetail,
  }
}
