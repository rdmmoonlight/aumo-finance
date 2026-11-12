import type { PeriodItem } from './periods.api'

// Bentuk data periode mengikuti respons backend (PeriodDto).
export type Period = PeriodItem

export interface CreatePeriodPayload {
  startDate: string
  endDate: string
}
