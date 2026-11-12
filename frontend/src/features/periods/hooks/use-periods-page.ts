import { computed, ref } from 'vue'
import {
  useClosePeriodMutation,
  useCreatePeriodMutation,
  useGetPeriodsQuery,
  useSelectPeriodMutation,
  type CreatePeriodRequest,
  type GetPeriodsApiResult,
} from '../periods.api'
import type { CreatePeriodPayload, Period } from '../types'

// Normalisasi berbagai bentuk respons API menjadi array periode
function normalizePeriods(raw: GetPeriodsApiResult | undefined): Period[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if ('periods' in raw) return raw.periods
  if ('items' in raw) return raw.items
  return []
}

export function usePeriodsPage() {
  const periodsQuery = useGetPeriodsQuery()
  const closePeriodMutation = useClosePeriodMutation()
  const createPeriodMutation = useCreatePeriodMutation()
  const selectPeriodMutation = useSelectPeriodMutation()

  const actionError = ref<string | null>(null)

  const periods = computed<Period[]>(() => normalizePeriods(periodsQuery.data.value))

  // Periode aktif: periode terbuka yang sedang dipilih, atau periode terbuka pertama
  const activePeriod = computed<Period | undefined>(
    () =>
      periods.value.find((p) => p.isSelected && !p.isClosed) ??
      periods.value.find((p) => !p.isClosed),
  )

  const hasActivePeriod = computed(() => !!activePeriod.value)

  // Gabungkan error dari query maupun dari aksi mutasi terakhir
  const errorMessage = computed(() => {
    if (actionError.value) return actionError.value
    const queryErr = periodsQuery.error.value
    if (!queryErr) return null
    return queryErr instanceof Error && queryErr.message
      ? queryErr.message
      : 'Gagal memuat daftar periode'
  })

  const fetchPeriods = async () => {
    actionError.value = null
    await periodsQuery.refetch()
  }

  const createPeriod = async (payload: CreatePeriodPayload) => {
    actionError.value = null
    try {
      await createPeriodMutation.mutateAsync({
        createPeriodRequest: payload as unknown as CreatePeriodRequest,
      })
    } catch (err: unknown) {
      actionError.value =
        err instanceof Error && err.message ? err.message : 'Gagal membuat periode baru'
    }
  }

  const closePeriod = async (id: number) => {
    actionError.value = null
    try {
      await closePeriodMutation.mutateAsync({ id })
    } catch (err: unknown) {
      actionError.value =
        err instanceof Error && err.message ? err.message : 'Gagal menutup periode'
    }
  }

  const selectPeriod = async (id: number) => {
    actionError.value = null
    try {
      await selectPeriodMutation.mutateAsync({ id })
    } catch (err: unknown) {
      actionError.value =
        err instanceof Error && err.message ? err.message : 'Gagal memilih periode'
    }
  }

  return {
    periods,
    isLoading: periodsQuery.isPending,
    isCreating: createPeriodMutation.isPending,
    isClosing: closePeriodMutation.isPending,
    isSelecting: selectPeriodMutation.isPending,
    hasActivePeriod,
    activePeriod,
    errorMessage,
    fetchPeriods,
    createPeriod,
    closePeriod,
    selectPeriod,
  }
}
