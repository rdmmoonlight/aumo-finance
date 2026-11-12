import { getApiV1Summary } from '@/lib/generated'

export type SummaryResponse = unknown

export async function getSummaryApi(signal?: AbortSignal) {
  const { data } = await getApiV1Summary({ signal, throwOnError: true })
  return data as SummaryResponse
}