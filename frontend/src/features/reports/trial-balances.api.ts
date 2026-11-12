import { getApiV1ReportsTrialBalances } from '@/lib/generated'

export type TrialBalanceType = 'unadjusted' | 'adjusted' | 'post-closing'

export interface GetTrialBalanceParams {
  type?: TrialBalanceType
}

export async function getTrialBalanceApi(params?: GetTrialBalanceParams, signal?: AbortSignal) {
  const { data } = await getApiV1ReportsTrialBalances({
    query: { type: params?.type ?? 'unadjusted' },
    signal,
    throwOnError: true,
  })
  return data as unknown
}