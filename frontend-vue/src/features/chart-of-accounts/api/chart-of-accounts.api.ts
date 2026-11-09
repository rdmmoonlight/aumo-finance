import {
  deleteApiV1ChartOfAccountsById,
  getApiV1ChartOfAccounts,
  postApiV1ChartOfAccounts,
  putApiV1ChartOfAccountsById,
} from '@/lib/generated'
import type { CreateAccountRequest, UpdateAccountRequest } from '@/lib/generated/types.gen'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export type { CreateAccountRequest, UpdateAccountRequest }

export interface GetChartOfAccountsParams {
  search?: string
  category?: string
}

export interface UpdateChartOfAccountArg {
  id: number
  updateAccountRequest: UpdateAccountRequest
}

// --- Query keys ---
export const chartOfAccountsKeys = {
  all: ['chart-of-accounts'] as const,
  list: (params?: GetChartOfAccountsParams) => ['chart-of-accounts', 'list', params ?? {}] as const,
}

// --- Fungsi API murni ---
export async function getChartOfAccountsApi(
  params?: GetChartOfAccountsParams,
  signal?: AbortSignal,
) {
  const { data } = await getApiV1ChartOfAccounts({
    // Nama query generated berhuruf kapital (Search, Category)
    query: { Search: params?.search, Category: params?.category },
    signal,
    throwOnError: true,
  })
  return data
}

export async function createChartOfAccountApi(body: CreateAccountRequest) {
  const { data } = await postApiV1ChartOfAccounts({
    body,
    throwOnError: true,
  })
  return data
}

export async function updateChartOfAccountApi({
  id,
  updateAccountRequest,
}: UpdateChartOfAccountArg) {
  const { data } = await putApiV1ChartOfAccountsById({
    path: { id },
    body: updateAccountRequest,
    throwOnError: true,
  })
  return data
}

export async function deleteChartOfAccountApi({ id }: { id: number }) {
  const { data } = await deleteApiV1ChartOfAccountsById({
    path: { id },
    throwOnError: true,
  })
  return data
}

// --- Composables ---
export function useGetChartOfAccountsQuery(
  params?: MaybeRefOrGetter<GetChartOfAccountsParams | undefined>,
) {
  return useQuery({
    queryKey: computed(() => chartOfAccountsKeys.list(toValue(params))),
    queryFn: ({ signal }) => getChartOfAccountsApi(toValue(params), signal),
  })
}

export function useCreateChartOfAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createChartOfAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chartOfAccountsKeys.all,
      })
    },
  })
}

export function useUpdateChartOfAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateChartOfAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chartOfAccountsKeys.all,
      })
    },
  })
}

export function useDeleteChartOfAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteChartOfAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chartOfAccountsKeys.all,
      })
    },
  })
}
