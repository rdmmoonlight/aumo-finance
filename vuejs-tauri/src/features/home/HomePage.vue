<template>
  <div class="grid w-full place-items-center py-6">
    <Card
      class="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl"
    >
      <CardContent class="p-6 md:p-8">
        <div class="rounded-xl border border-white/10 bg-slate-900/80 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-xl font-bold text-amber-400">
              <ChartLine :size="18" /> Market Indicators
            </h3>

            <div class="flex items-center gap-2">
              <Badge
                variant="outline"
                class="border-emerald-500/20 bg-emerald-500/10 text- text-emerald-400"
              >
                LIVE
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                :disabled="isFetching"
                class="h-7 w-7 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                title="Refresh Indikator Pasar"
                @click="fetchMarketData(true)"
              >
                <RotateCw :size="14" :class="isFetching ? 'animate-spin text-amber-400' : ''" />
              </Button>
            </div>
          </div>

          <div
            v-if="lastUpdated"
            class="mb-3 flex items-center justify-end gap-1.5 text- text-white/50"
          >
            <Clock :size="12" />
            <span>Diperbarui: {{ lastUpdated }} WIB</span>
          </div>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div v-if="isLoading" class="col-span-2 py-4 text-center text-xs text-white/40">
              Memuat indikator pasar...
            </div>
            <div v-else-if="isError" class="col-span-2 py-4 text-center text-xs text-rose-400">
              Gagal memuat indikator pasar dari server.
            </div>
            <template v-else-if="marketData.length > 0">
              <div
                v-for="item in marketData"
                :key="item.symbol"
                class="flex min-h- flex-col justify-between rounded-lg border border-white/10 bg-black/40 p-2.5"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-white">{{ item.symbol }}</span>
                  <Badge
                    :class="[
                      'flex items-center border-0 px-1.5 py-0.5 text-',
                      item.isUp
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-red-500/15 text-red-400',
                    ]"
                  >
                    <TrendingUp v-if="item.isUp" :size="12" class="mr-0.5" />
                    <TrendingDown v-else :size="12" class="mr-0.5" />
                    {{ item.change }}
                  </Badge>
                </div>
                <div class="mt-1 text-sm font-semibold text-white">{{ item.price }}</div>
                <div class="text-xs text-white/50">{{ item.name }}</div>
              </div>
            </template>
            <div v-else class="col-span-2 py-4 text-center text-xs text-white/40">
              Tidak ada data pasar tersedia.
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="mx-auto max-w-md text-base leading-relaxed text-white/80">
            Integrated financial & accounting intelligence core. Manage full-cycle general ledgers,
            trial balances, and operational analytics with absolute precision.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              as-child
              class="flex items-center gap-2 rounded-xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500/80 to-violet-600/80 text-sm text-white shadow-lg hover:from-indigo-500 hover:to-violet-600"
            >
              <RouterLink to="/dashboard"> <LayoutDashboard :size="16" /> Dashboard </RouterLink>
            </Button>
            <Button
              as-child
              variant="secondary"
              class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 text-sm text-white hover:bg-white/15"
            >
              <RouterLink to="/journal-entry"> <Notebook :size="16" /> Journal Entry </RouterLink>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import {
  ChartLine,
  Clock,
  LayoutDashboard,
  Notebook,
  RotateCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGetMarketIndicatorsQuery } from './home.api'

interface MarketItem {
  symbol: string
  name: string
  price: string
  change: string
  isUp: boolean
}

const lastUpdated = ref('')

const {
  data: rawResponse,
  isLoading,
  isFetching,
  isError,
  refetch,
} = useQuery({
  queryKey: ['market-indicators'],
  queryFn: () => useGetMarketIndicatorsQuery(),
})

function updateTimestamp() {
  lastUpdated.value = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

watch(rawResponse, (val) => {
  if (val) updateTimestamp()
})

async function fetchMarketData(isManualRefresh = false) {
  try {
    const result = await refetch()

    if (result.isError) {
      toast.error('Gagal memperbarui indikator pasar')
    } else {
      updateTimestamp()
      if (isManualRefresh) {
        toast.success('Indikator pasar berhasil diperbarui')
      }
    }
  } catch {
    toast.error('Terjadi kesalahan saat memuat indikator pasar')
  }
}

function extractRawItems(res: unknown): Record<string, unknown>[] {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.items)) return obj.items
    if (Array.isArray(obj.result)) return obj.result
    if (Array.isArray(obj.rates)) return obj.rates
    return [obj]
  }
  return []
}

const rawList = computed(() => extractRawItems(rawResponse.value))

const marketData = computed<MarketItem[]>(() =>
  rawList.value.map((item) => {
    const symbol = String(item.symbol ?? item.Symbol ?? item.code ?? item.currency ?? 'N/A')
    const name = String(item.name ?? item.Name ?? item.description ?? item.pair ?? '')
    const rawPrice = item.price ?? item.Price ?? item.value ?? item.rate ?? 0
    const rawChange = item.change ?? item.Change ?? item.changePercent ?? 0
    const isUp = Boolean(item.isUp ?? item.IsUp ?? Number(rawChange) >= 0)

    const numericPrice = Number(rawPrice)
    const isCurrency = symbol.includes('/IDR')
    const formattedPrice = Number.isFinite(numericPrice)
      ? isCurrency
        ? `Rp ${Math.round(numericPrice).toLocaleString('id-ID')}`
        : numericPrice.toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
      : String(rawPrice)

    const numericChange = Number(rawChange)
    const formattedChange = Number.isFinite(numericChange)
      ? `${numericChange >= 0 ? '+' : ''}${numericChange.toFixed(2)}%`
      : String(rawChange)

    return {
      symbol,
      name,
      price: formattedPrice,
      change: formattedChange,
      isUp,
    }
  }),
)
</script>
