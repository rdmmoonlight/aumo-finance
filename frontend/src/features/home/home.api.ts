import { getApiV1HomeMarketIndicators, getApiV1Kurs } from '@/lib/generated'
import { useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

// --- Tipe ---
export interface KursParams {
  baseCurrency?: string
  targetCurrency?: string
}

export interface KursResponse {
  success?: boolean
  baseCurrency?: string
  targetCurrency?: string
  rate?: number
  lastUpdated?: string
  [key: string]: unknown
}

export interface MarketIndicatorItem {
  id?: string
  name?: string
  symbol?: string
  value?: number
  changePercent?: number
  [key: string]: unknown
}

export interface MarketIndicatorsResponse {
  success?: boolean
  indicators?: MarketIndicatorItem[]
  [key: string]: unknown
}

// --- Query keys ---
export const homeKeys = {
  all: ['home'] as const,
  kurs: (params?: KursParams) => ['home', 'kurs', params ?? {}] as const,
  marketIndicators: ['home', 'market-indicators'] as const,
}

// --- Fungsi API murni ---
export async function getKursApi(params?: KursParams, signal?: AbortSignal) {
  const { data } = await getApiV1Kurs({
    query: {
      BaseCurrency: params?.baseCurrency,
      TargetCurrency: params?.targetCurrency,
    },
    signal,
    throwOnError: true,
  })
  return data as KursResponse
}

export async function getMarketIndicatorsApi(signal?: AbortSignal) {
  const { data } = await getApiV1HomeMarketIndicators({
    signal,
    throwOnError: true,
  })
  return data as MarketIndicatorsResponse
}

// --- Composables ---
export function useGetKursQuery(params?: MaybeRefOrGetter<KursParams | undefined>) {
  return useQuery({
    queryKey: computed(() => homeKeys.kurs(toValue(params))),
    queryFn: ({ signal }) => getKursApi(toValue(params), signal),
  })
}

export function useGetMarketIndicatorsQuery() {
  return useQuery({
    queryKey: homeKeys.marketIndicators,
    queryFn: ({ signal }) => getMarketIndicatorsApi(signal),
  })
}
