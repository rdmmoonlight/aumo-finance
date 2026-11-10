import { ref } from 'vue'
import { createPeriodApi } from '../periods.api'
import type { CreatePeriodPayload } from '../types'

export function useCreatePeriodForm(onSuccessCallback?: () => void) {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const submitForm = async (payload: CreatePeriodPayload) => {
        isLoading.value = true
        error.value = null
        try {
            await createPeriodApi({
                createPeriodRequest: payload as unknown as NonNullable<Parameters<typeof createPeriodApi>[0]['createPeriodRequest']>,
            })
            if (onSuccessCallback) onSuccessCallback()
        } catch (err: unknown) {
            error.value = err instanceof Error && err.message
                ? err.message
                : 'Terjadi kesalahan saat membuat periode'
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        submitForm,
    }
}