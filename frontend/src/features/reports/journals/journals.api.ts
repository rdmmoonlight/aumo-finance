import {
  deleteApiV1ReportsJournalsAdjustingById,
  getApiV1ReportsJournalsAdjusting,
  getApiV1ReportsJournalsClosing,
  getApiV1ReportsJournalsGeneral,
} from '@/lib/generated'

export async function getJournalsGeneralApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsJournalsGeneral({
    signal,
    throwOnError: true,
  })
  return data as unknown
}

export async function getJournalsAdjustingApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsJournalsAdjusting({
    signal,
    throwOnError: true,
  })
  return data as unknown
}

export async function deleteJournalsAdjustingByIdApi({ id }: { id: number }) {
  const { data } = await deleteApiV1ReportsJournalsAdjustingById({
    path: { id },
    throwOnError: true,
  })
  return data as unknown
}

export async function getJournalsClosingApi(signal?: AbortSignal) {
  const { data } = await getApiV1ReportsJournalsClosing({
    signal,
    throwOnError: true,
  })
  return data as unknown
}