import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useClosePeriodMutation,
  useCreatePeriodMutation,
  useGetPeriodsQuery,
  type CreatePeriodRequest,
} from '../periods.api'
import type { CreatePeriodPayload, Period } from '../types'

export function usePeriodsPage() {
  const router = useRouter()
  const periodsQuery = useGetPeriodsQuery()
  const closePeriodMutation = useClosePeriodMutation()
  const createPeriodMutation = useCreatePeriodMutation()

  const actionError = ref<string | null>(null)

  // Normalisasi berbagai bentuk respons API (GetPeriodsApiResult) menjadi array
  const periods = computed<Period[]>(() => {
    const raw = periodsQuery.data.value
    if (!raw) return []

    const list = Array.isArray(raw)
      ? raw
      : 'periods' in raw
        ? raw.periods
        : 'items' in raw
          ? raw.items
          : []

    return list as unknown as Period[]
  })

  const activePeriod = computed(() => periods.value.find((p) => p.status === 'ACTIVE'))

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
      // Cache otomatis ter-invalidate oleh onSuccess di useCreatePeriodMutation
    } catch (err: unknown) {
      actionError.value =
        err instanceof Error && err.message ? err.message : 'Gagal membuat periode baru'
    }
  }

  const closePeriod = async (id: string | number) => {
    actionError.value = null
    try {
      await closePeriodMutation.mutateAsync({ id: Number(id) })
      // Cache otomatis ter-invalidate oleh onSuccess di useClosePeriodMutation
    } catch (err: unknown) {
      actionError.value =
        err instanceof Error && err.message ? err.message : 'Gagal menutup periode'
    }
  }

  const navigateToDetail = (id: string | number) => {
    router.push(`/periods/${id}`)
  }

  return {
    periods,
    isLoading: periodsQuery.isPending,
    isCreating: createPeriodMutation.isPending,
    isClosing: closePeriodMutation.isPending,
    hasActivePeriod,
    activePeriod,
    errorMessage,
    fetchPeriods,
    createPeriod,
    closePeriod,
    navigateToDetail,
  }
}
