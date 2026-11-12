import {
  getApiV1ReportsGeneralLedgersPermanent,
  getApiV1ReportsGeneralLedgersTemporary,
  postApiV1ReportsGeneralLedgersRefresh,
} from '@/lib/generated'

export interface GetGeneralLedgerPermanentResponse {
  success: boolean
  hasPeriodSelected: boolean
  selectedPeriodName?: string
  isTemporary: boolean
  message?: string
  accounts?: Array<unknown>
}

export interface GetGeneralLedgerTemporaryResponse {
  success: boolean
  hasPeriodSelected: boolean
  selectedPeriodName?: string
  isTemporary: boolean
  netIncomeBeforeClosing?: number
  message?: string
  accounts?: Array<unknown>
}

export interface RefreshGeneralLedgerResponse {
  success: boolean
  message?: string
  [key: string]: unknown
}

export async function getGeneralLedgerPermanentApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsGeneralLedgersPermanent({
    signal,
    throwOnError: true,
  })
  return data as GetGeneralLedgerPermanentResponse
}

export async function getGeneralLedgerTemporaryApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsGeneralLedgersTemporary({
    signal,
    throwOnError: true,
  })
  return data as GetGeneralLedgerTemporaryResponse
}

export async function refreshGeneralLedgerApi() {
  const { data } = await postApiV1ReportsGeneralLedgersRefresh({
    throwOnError: true,
  })
  return data as RefreshGeneralLedgerResponse
}