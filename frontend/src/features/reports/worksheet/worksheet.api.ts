import { getApiV1ReportsWorksheet } from '@/lib/generated'

export async function getWorksheetApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsWorksheet({
    signal,
    throwOnError: true,
  })
  return data as unknown
}