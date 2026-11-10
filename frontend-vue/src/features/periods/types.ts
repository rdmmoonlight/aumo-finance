export interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'CLOSED'
  createdAt?: string
  updatedAt?: string
}

export interface CreatePeriodPayload {
  startDate: string
  endDate: string
}
