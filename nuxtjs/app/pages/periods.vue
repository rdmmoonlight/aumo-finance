<script setup lang="ts">
// pages/periods/index.vue - REVISI ENDPOINT TERBARU PRISMA
interface PeriodRaw {
  Id: number
  PeriodName: string
  StartDate: string
  EndDate: string
  IsClosed: boolean
  IsSelected: boolean
}
interface PeriodItem {
  id: number
  periodName: string
  startDate: string
  endDate: string
  isClosed: boolean
  isSelected: boolean
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
]

const ENDPOINTS = {
  LIST: '/api/v1/periods',
  CREATE: '/api/v1/periods',
  SELECT: (id: number) => `/api/v1/periods/${id}/select`,
  CLEAR: '/api/v1/periods/clear-selection',
  CLOSE: (id: number) => `/api/v1/periods/${id}/close`,
}

const viewMode = ref<'list' | 'create'>('list')
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const selectingId = ref<number | null>(null)
const closingId = ref<number | null>(null)
const isClearing = ref(false)
const isCreating = ref(false)
const isLoading = ref(false)

const periods = ref<PeriodItem[]>([])
const month = ref(new Date().getMonth() + 1)
const year = ref(new Date().getFullYear())

const monthOptions = MONTH_NAMES.map((label, i) => ({ label, value: i + 1 }))
const selectedPeriod = computed(() => periods.value.find(p => p.isSelected) || null)

const mapRaw = (raw: PeriodRaw[]): PeriodItem[] => {
  return raw.map(r => ({
    id: r.Id,
    periodName: r.PeriodName,
    startDate: r.StartDate,
    endDate: r.EndDate,
    isClosed: r.IsClosed,
    isSelected: r.IsSelected
  }))
}

const fetchPeriods = async () => {
  isLoading.value = true
  try {
    const raw: any = await $fetch(ENDPOINTS.LIST)
    // support array langsung atau { items: [] }
    const arr = Array.isArray(raw)? raw : raw?.items || []
    periods.value = mapRaw(arr as PeriodRaw[])
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Gagal load periods'
  } finally {
    isLoading.value = false
  }
}

const handleSelectPeriod = async (p: PeriodItem) => {
  errorMessage.value = null
  selectingId.value = p.id
  try {
    await $fetch(ENDPOINTS.SELECT(p.id), { method: 'POST' })
    successMessage.value = `Now viewing: ${p.periodName}`
    await fetchPeriods()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Gagal memilih periode.'
  } finally {
    selectingId.value = null
  }
}

const handleClearSelection = async () => {
  errorMessage.value = null
  isClearing.value = true
  try {
    await $fetch(ENDPOINTS.CLEAR, { method: 'POST' })
    successMessage.value = 'No period selected.'
    await fetchPeriods()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Gagal clear selection.'
  } finally {
    isClearing.value = false
  }
}

const handleClosePeriod = async (p: PeriodItem) => {
  if (!confirm(`Close ${p.periodName}? Ini akan lock semua transaksi di periode ini.`)) return
  errorMessage.value = null
  closingId.value = p.id
  try {
    await $fetch(ENDPOINTS.CLOSE(p.id), { method: 'POST' })
    successMessage.value = `${p.periodName} closed.`
    await fetchPeriods()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Failed to close period.'
  } finally {
    closingId.value = null
  }
}

const handleCreateSubmit = async () => {
  errorMessage.value = null
  isCreating.value = true
  try {
    await $fetch(ENDPOINTS.CREATE, {
      method: 'POST',
      body: { month: month.value, year: year.value }
    })
    successMessage.value = 'Period opened successfully.'
    viewMode.value = 'list'
    await fetchPeriods()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Gagal create period.'
  } finally {
    isCreating.value = false
  }
}

const formatDate = (d?: string) => d? new Date(d).toLocaleDateString('id-ID') : '-'

onMounted(fetchPeriods)
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto p-4">
    <UAlert v-if="errorMessage" color="error" variant="subtle" :title="errorMessage" icon="i-lucide-triangle-alert" :close-button="{ icon: 'i-lucide-x' }" @close="errorMessage = null" />
    <UAlert v-if="successMessage" color="success" variant="subtle" :title="successMessage" icon="i-lucide-check-circle" :close-button="{ icon: 'i-lucide-x' }" @close="successMessage = null" />

    <template v-if="viewMode === 'list'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold flex items-center gap-2"><UIcon name="i-lucide-calendar" class="size-5" /> Accounting Periods</h1>
          <p class="text-sm text-muted mt-1">Period yang aktif akan dipakai di semua halaman</p>
        </div>
        <div class="flex gap-2">
          <UButton v-if="selectedPeriod" variant="outline" size="sm" :loading="isClearing" icon="i-lucide-eye-off" @click="handleClearSelection">Stop Viewing</UButton>
          <UButton size="sm" icon="i-lucide-plus" @click="viewMode = 'create'">Open New Period</UButton>
        </div>
      </div>

      <UCard class="overflow-hidden bg-[#151519] border border-white/[0.07]" :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex items-center justify-between py-1">
            <span class="text-sm font-semibold text-white">Period List</span>
            <UBadge variant="subtle" color="neutral">{{ periods.length }} total</UBadge>
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/[0.06] text-zinc-500 text-left">
                <th class="pl-6 py-3">Period Name</th>
                <th>Start</th>
                <th>End</th>
                <th class="text-center">Status</th>
                <th class="pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading"><td colspan="5" class="text-center py-8 text-zinc-500"><UIcon name="i-lucide-loader-2" class="animate-spin inline mr-2" /> Loading...</td></tr>
              <tr v-for="p in periods" :key="p.id" class="border-b border-white/[0.06]" :class="[selectedPeriod?.id === p.id? 'bg-white/[0.06] border-l-4 border-l-white' : 'hover:bg-white/[0.03]', p.isClosed && selectedPeriod?.id!== p.id? 'opacity-50' : '']">
                <td class="pl-6 py-3 flex items-center gap-2">
                  <span :class="selectedPeriod?.id === p.id? 'text-white font-bold' : 'text-zinc-200'">{{ p.periodName }}</span>
                  <UBadge v-if="selectedPeriod?.id === p.id" class="bg-white text-black font-bold text-">VIEWING</UBadge>
                </td>
                <td class="text-xs text-zinc-400">{{ formatDate(p.startDate) }}</td>
                <td class="text-xs text-zinc-400">{{ formatDate(p.endDate) }}</td>
                <td class="text-center">
                  <UBadge v-if="p.isClosed" color="neutral" variant="subtle"><UIcon name="i-lucide-lock" class="size-3" /> Closed</UBadge>
                  <UBadge v-else color="success" variant="subtle"><UIcon name="i-lucide-lock-open" class="size-3" /> Active</UBadge>
                </td>
                <td class="pr-6 py-3">
                  <div class="flex justify-center gap-1.5">
                    <UButton size="xs" :loading="selectingId === p.id" :icon="selectedPeriod?.id === p.id? 'i-lucide-eye-off' : 'i-lucide-eye'" :variant="selectedPeriod?.id === p.id? 'solid' : 'outline'" @click="handleSelectPeriod(p)">{{ selectedPeriod?.id === p.id? 'VIEWING' : 'VIEW' }}</UButton>
                    <UButton v-if="!p.isClosed" size="xs" variant="ghost" icon="i-lucide-lock" :loading="closingId === p.id" @click="handleClosePeriod(p)" />
                  </div>
                </td>
              </tr>
              <tr v-if="!isLoading && periods.length === 0"><td colspan="5" class="text-center py-12 text-zinc-500"><UIcon name="i-lucide-calendar-off" class="size-7 mx-auto mb-2 block" />No periods yet</td></tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>

    <template v-else>
      <div class="max-w-xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold flex items-center gap-2"><UIcon name="i-lucide-calendar-plus" class="size-5" /> Open New Period</h1>
          <UButton variant="outline" size="sm" icon="i-lucide-arrow-left" @click="viewMode = 'list'">Back</UButton>
        </div>
        <form @submit.prevent="handleCreateSubmit" class="space-y-6">
          <UCard class="bg-[#151519] border border-white/[0.07]">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Month"><USelect v-model="month" :items="monthOptions" class="w-full" /></UFormField>
              <UFormField label="Year"><UInput v-model.number="year" type="number" required /></UFormField>
            </div>
          </UCard>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="viewMode = 'list'">Cancel</UButton>
            <UButton type="submit" :loading="isCreating">Submit Period</UButton>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
