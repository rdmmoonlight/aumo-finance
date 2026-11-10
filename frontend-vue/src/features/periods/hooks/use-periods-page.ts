import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    useClosePeriodMutation,
    useCreatePeriodMutation,
    useGetPeriodsQuery,
} from '../periods.api'
import type { CreatePeriodPayload, Period } from '../types'

export function usePeriodsPage() {
    const router = useRouter()
    const periodsQuery = useGetPeriodsQuery()
    const closePeriodMutation = useClosePeriodMutation()
    const createPeriodMutation = useCreatePeriodMutation()
    const periods = ref<Period[]>([])
    const isLoading = ref(false)
    const isCreating = ref(false)
    const errorMessage = ref<string | null>(null)

    const activePeriod = computed(() =>
        periods.value.find((p) => p.status === 'ACTIVE')
    )

    const hasActivePeriod = computed(() => !!activePeriod.value)

    const fetchPeriods = async () => {
        isLoading.value = true
        errorMessage.value = null
        try {
            const result = await periodsQuery.refetch()
            periods.value = (result.data ?? []) as unknown as Period[]
        } catch (err: unknown) {
            errorMessage.value =
                (err instanceof Error ? err.message : '') ||
                'Gagal memuat daftar periode'
        } finally {
            isLoading.value = false
        }
    }

    const createPeriod = async (payload: CreatePeriodPayload) => {
        isCreating.value = true
        errorMessage.value = null
        try {
            await createPeriodMutation.mutateAsync({
                createPeriodRequest: payload as unknown as NonNullable<
                    Parameters<typeof createPeriodMutation.mutateAsync>[0]['createPeriodRequest']
                >,
            })
            await fetchPeriods()
        } catch (err: unknown) {
            errorMessage.value =
                (err instanceof Error ? err.message : '') ||
                'Gagal membuat periode baru'
        } finally {
            isCreating.value = false
        }
    }

    const closePeriod = async (id: string) => {
        try {
            await closePeriodMutation.mutateAsync({ id: Number(id) })
            await fetchPeriods()
        } catch (err: unknown) {
            errorMessage.value =
                (err instanceof Error ? err.message : '') ||
                'Gagal menutup periode'
        }
    }

    const navigateToDetail = (id: string) => {
        router.push(`/periods/${id}`)
    }

    onMounted(() => {
        fetchPeriods()
    })

    return {
        periods,
        isLoading,
        isCreating,
        hasActivePeriod,
        activePeriod,
        errorMessage,
        fetchPeriods,
        createPeriod,
        closePeriod,
        navigateToDetail,
    }
}