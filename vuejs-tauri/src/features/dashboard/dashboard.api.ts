import { getApiV1Dashboard } from '@/lib/generated'
import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface GetDashboardParams {
  period?: string
}

// Generated belum punya skema respons, sesuaikan dengan DTO backend bila sudah ada
export type GetDashboardResponse = unknown

// --- Query keys ---
export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: (params?: GetDashboardParams) => ['dashboard', 'detail', params ?? {}] as const,
}

// --- Fungsi API murni ---
export async function getDashboardApi(params?: GetDashboardParams, signal?: AbortSignal) {
  const { data } = await getApiV1Dashboard({
    query: { Period: params?.period },
    signal,
    throwOnError: true,
  })
  return data as GetDashboardResponse
}

// --- Composables ---
export function useGetDashboardQuery(params?: MaybeRefOrGetter<GetDashboardParams | undefined>) {
  return useQuery({
    queryKey: computed(() => dashboardKeys.detail(toValue(params))),
    queryFn: ({ signal }) => getDashboardApi(toValue(params), signal),
  })
}
