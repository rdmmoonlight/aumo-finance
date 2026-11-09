import {
  getApiV1Periods,
  getApiV1PeriodsOpenInfo,
  postApiV1Periods,
  postApiV1PeriodsClearSelection,
  postApiV1PeriodsCloseById,
  postApiV1PeriodsSelectById,
} from '@/lib/generated'
import type { CreatePeriodRequest } from '@/lib/generated/types.gen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export type { CreatePeriodRequest }

// --- Tipe respons ---
export interface PeriodItem {
  id: number
  periodName: string
  month: number
  year: number
  startDate: string
  endDate: string
  status?: 'Open' | 'Closed' | string
  isClosed?: boolean
  isSelected: boolean
}

export interface GetPeriodsResponse {
  success?: boolean
  selectedPeriodId?: number | null
  periods: PeriodItem[]
}

export type GetPeriodsApiResult = PeriodItem[] | { items: PeriodItem[] } | GetPeriodsResponse

export interface PeriodsOpenInfo {
  hasExistingPermanentAccounts: boolean
  availableCashAndBankAccounts?: Array<{
    id: number
    name: string
    code: string
  }>
  availableRetainedEarningsAccounts?: Array<{
    id: number
    name: string
    code: string
  }>
}

// --- Query keys ---
export const periodsKeys = {
  all: ['periods'] as const,
  list: ['periods', 'list'] as const,
  openInfo: ['periods', 'open-info'] as const,
}

// --- Fungsi API murni ---
export async function getPeriodsApi(signal?: AbortSignal) {
  const { data } = await getApiV1Periods({ signal, throwOnError: true })
  return data as GetPeriodsApiResult
}

export async function getPeriodsOpenInfoApi(signal?: AbortSignal) {
  const { data } = await getApiV1PeriodsOpenInfo({
    signal,
    throwOnError: true,
  })
  return data as PeriodsOpenInfo
}

export async function createPeriodApi({
  createPeriodRequest,
}: {
  createPeriodRequest: CreatePeriodRequest
}) {
  const { data } = await postApiV1Periods({
    body: createPeriodRequest,
    throwOnError: true,
  })
  return data
}

export async function selectPeriodApi({ id }: { id: number }) {
  const { data } = await postApiV1PeriodsSelectById({
    path: { id },
    throwOnError: true,
  })
  return data
}

export async function clearPeriodSelectionApi() {
  const { data } = await postApiV1PeriodsClearSelection({
    throwOnError: true,
  })
  return data
}

export async function closePeriodApi({ id }: { id: number }) {
  const { data } = await postApiV1PeriodsCloseById({
    path: { id },
    throwOnError: true,
  })
  return data
}

// --- Composables ---
// Periode terpilih menentukan cakupan seluruh data (jurnal, laporan, dashboard),
// sehingga setiap perubahan periode meng-invalidate seluruh cache.
function useInvalidateAllAfterPeriodChange() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries()
  }
}

export function useGetPeriodsQuery() {
  return useQuery({
    queryKey: periodsKeys.list,
    queryFn: ({ signal }) => getPeriodsApi(signal),
  })
}

export function useGetPeriodsOpenInfoQuery() {
  return useQuery({
    queryKey: periodsKeys.openInfo,
    queryFn: ({ signal }) => getPeriodsOpenInfoApi(signal),
  })
}

export function useCreatePeriodMutation() {
  const invalidate = useInvalidateAllAfterPeriodChange()
  return useMutation({ mutationFn: createPeriodApi, onSuccess: invalidate })
}

export function useSelectPeriodMutation() {
  const invalidate = useInvalidateAllAfterPeriodChange()
  return useMutation({ mutationFn: selectPeriodApi, onSuccess: invalidate })
}

export function useClearSelectionMutation() {
  const invalidate = useInvalidateAllAfterPeriodChange()
  return useMutation({
    mutationFn: clearPeriodSelectionApi,
    onSuccess: invalidate,
  })
}

export function useClosePeriodMutation() {
  const invalidate = useInvalidateAllAfterPeriodChange()
  return useMutation({ mutationFn: closePeriodApi, onSuccess: invalidate })
}
