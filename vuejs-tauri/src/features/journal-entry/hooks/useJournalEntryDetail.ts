import { onMounted, ref } from 'vue'
import { getJournalEntryByIdApi } from '../journal-entry.api'

type JournalEntry = Awaited<ReturnType<typeof getJournalEntryByIdApi>>

export function useJournalEntryDetail(id?: string) {
  const entry = ref<JournalEntry | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchDetail = async (entryId: string) => {
    isLoading.value = true
    error.value = null
    try {
      entry.value = (await getJournalEntryByIdApi(Number(entryId))) as JournalEntry
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Gagal mengambil detail entri jurnal'
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
