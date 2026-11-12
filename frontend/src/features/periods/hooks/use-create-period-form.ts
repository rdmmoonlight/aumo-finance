import { computed } from 'vue'
import { useCreatePeriodMutation, type CreatePeriodRequest } from '../periods.api'
import type { CreatePeriodPayload } from '../types'

export function useCreatePeriodForm(onSuccessCallback?: () => void) {
  const { mutateAsync, isPending, error: mutationError } = useCreatePeriodMutation()

  const error = computed(() => {
    if (!mutationError.value) return null
    return mutationError.value instanceof Error && mutationError.value.message
      ? mutationError.value.message
      : 'Terjadi kesalahan saat membuat periode'
  })

  const submitForm = async (payload: CreatePeriodPayload) => {
    try {
      await mutateAsync({
        createPeriodRequest: payload as unknown as CreatePeriodRequest,
      })
      onSuccessCallback?.()
    } catch {
      // Error sudah otomatis ditangkap dan disimpan ke state `mutationError`
    }
  }

  return {
    isLoading: isPending,
    error,
    submitForm,
  }
}
