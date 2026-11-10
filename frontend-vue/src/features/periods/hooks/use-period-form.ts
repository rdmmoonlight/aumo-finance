import { ref } from 'vue'
import type { CreatePeriodPayload } from '../types'

export function usePeriodForm() {
  const startDate = ref('')
  const endDate = ref('')

  const resetForm = () => {
    startDate.value = ''
    endDate.value = ''
  }

  const setFormData = (data: CreatePeriodPayload) => {
    startDate.value = data.startDate
    endDate.value = data.endDate
  }

  return {
    startDate,
    endDate,
    resetForm,
    setFormData,
  }
}
