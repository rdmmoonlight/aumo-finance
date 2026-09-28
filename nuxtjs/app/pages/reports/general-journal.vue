<!-- pages/reports/general-journal.vue -->
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  layout: 'default'
})

const isLoading = ref(false)
const journalData = ref<any[]>([])
const searchQuery = ref('')

const fetchReport = async () => {
  isLoading.value = true
  try {
    const res: any = await $fetch('/api/v1/journal-entries')
    journalData.value = Array.isArray(res) ? res : []
  } catch (err) {
    console.error('Gagal mengambil data laporan:', err)
  } finally {
    isLoading.value = false
  }
}

// Filter data pencarian
const filteredData = computed(() => {
  if (!searchQuery.value) return journalData.value

  const q = searchQuery.value.toLowerCase()
  return journalData.value.filter((entry) => {
    const matchTx = entry.TransactionNumber?.toLowerCase().includes(q)
    const matchType = entry.JournalType?.toLowerCase().includes(q)
    const matchLines = entry.JournalEntryLines?.some((line: any) =>
      line.ChartOfAccounts?.AccountName?.toLowerCase().includes(q) ||
      line.ChartOfAccounts?.ReferenceNumber?.toString().includes(q) ||
      line.LineDescription?.toLowerCase().includes(q)
    )
    return matchTx || matchType || matchLines
  })
})

// Flatten data untuk TanStack UTable
const flattenedRows = computed(() => {
  const rows: any[] = []

  filteredData.value.forEach((entry) => {
    // Row Header Jurnal
    rows.push({
      isHeader: true,
      id: `header-${entry.Id}`,
      entryDate: new Date(entry.EntryDate).toLocaleDateString('id-ID'),
      transactionNumber: entry.TransactionNumber,
      journalType: entry.JournalType
    })

    // Baris Lines (Detail Akun)
    entry.JournalEntryLines?.forEach((line: any) => {
      rows.push({
        isHeader: false,
        id: `line-${line.Id}`,
        accountRef: line.ChartOfAccounts?.ReferenceNumber,
        accountName: line.ChartOfAccounts?.AccountName,
        lineDescription: line.LineDescription,
        debit: Number(line.Debit) || 0,
        credit: Number(line.Credit) || 0
      })
    })
  })

  return rows
})

// Konfigurasi Kolom UTable (TanStack Table Schema)
const columns = ref<TableColumn<any>[]>([
  { accessorKey: 'entryDate', header: 'Tanggal / Kode Akun' },
  { accessorKey: 'transactionNumber', header: 'No. Transaksi / Nama Akun' },
  { accessorKey: 'journalType', header: 'Tipe / Catatan' },
  { accessorKey: 'debit', header: 'Debit', class: 'text-right' },
  { accessorKey: 'credit', header: 'Kredit', class: 'text-right' }
])

// Total Debit & Kredit
const totalDebit = computed(() => {
  return journalData.value.reduce((acc, entry) => {
    const sum = entry.JournalEntryLines?.reduce((s: number, l: any) => s + (Number(l.Debit) || 0), 0) || 0
    return acc + sum
  }, 0)
})

const totalCredit = computed(() => {
  return journalData.value.reduce((acc, entry) => {
    const sum = entry.JournalEntryLines?.reduce((s: number, l: any) => s + (Number(l.Credit) || 0), 0) || 0
    return acc + sum
  }, 0)
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(num || 0)
}

onMounted(fetchReport)
</script>

<template>
  <!-- KONTAINER UTAMA: Memunci Tinggi Tepat 100vh tanpa Scroll Global Utama -->
  <UDashboardPage class="h-screen overflow-hidden">
    <UDashboardPanel grow class="h-full flex flex-col overflow-hidden">
      
      <!-- Top Navbar (Tetap Diam di Atas) -->
      <UDashboardNavbar title="Laporan Jurnal Umum" badge="Report">
        <template #right>
          <UButton icon="i-lucide-printer" color="neutral" variant="outline" label="Cetak" @click="() => window.print()" />
          <UButton icon="i-lucide-download" color="primary" label="Export Excel" />
        </template>
      </UDashboardNavbar>

      <!-- SCROLL CONTAINER 1: Scroll Halaman/Panel (Filter & Header) -->
      <UDashboardPanelContent class="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto min-h-0">
        
        <!-- Toolbar & Filter Atas -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <UButton to="/reports" icon="i-lucide-arrow-left" variant="ghost" color="neutral" size="xs" label="Kembali ke Pusat Laporan" />

          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Cari transaksi / akun..."
            size="xs"
            class="w-full sm:w-64"
          />
        </div>

        <!-- Card Wrapper Laporan -->
        <UCard class="flex-1 flex flex-col min-h-0 overflow-hidden" :ui="{ body: 'flex-1 flex flex-col p-0 sm:p-0 min-h-0 overflow-hidden' }">
          
          <template #header>
            <div class="flex justify-between items-center p-4 shrink-0">
              <div>
                <h3 class="font-bold text-base">Rincian Transaksi Jurnal Umum</h3>
                <p class="text-xs text-neutral-500">Dual Independent Scroll Active.</p>
              </div>
              <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="xs" :loading="isLoading" @click="fetchReport" />
            </div>
          </template>

          <!-- SCROLL CONTAINER 2: Scroll Khusus Tabel (Independent Table Scroll) -->
          <div class="flex-1 overflow-auto min-h-0">
            <UTable
              :data="flattenedRows"
              :columns="columns"
              :loading="isLoading"
              class="w-full"
            >
              <!-- Cell Custom Render -->
              <template #entryDate-cell="{ row }">
                <span v-if="row.original.isHeader" class="font-bold text-neutral-800 dark:text-neutral-100">
                  {{ row.original.entryDate }}
                </span>
                <span v-else class="pl-6 font-mono text-neutral-400 text-xs">
                  [{{ row.original.accountRef }}]
                </span>
              </template>

              <template #transactionNumber-cell="{ row }">
                <span v-if="row.original.isHeader" class="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {{ row.original.transactionNumber }}
                </span>
                <span v-else class="font-medium text-neutral-800 dark:text-neutral-200">
                  {{ row.original.accountName }}
                </span>
              </template>

              <template #journalType-cell="{ row }">
                <UBadge v-if="row.original.isHeader" size="xs" color="neutral" variant="subtle">
                  {{ row.original.journalType }}
                </UBadge>
                <span v-else-if="row.original.lineDescription" class="text-xs text-neutral-400 italic">
                  {{ row.original.lineDescription }}
                </span>
              </template>

              <template #debit-cell="{ row }">
                <span v-if="!row.original.isHeader && row.original.debit > 0" class="font-mono text-xs">
                  {{ formatNumber(row.original.debit) }}
                </span>
                <span v-else-if="!row.original.isHeader">-</span>
              </template>

              <template #credit-cell="{ row }">
                <span v-if="!row.original.isHeader && row.original.credit > 0" class="font-mono text-xs">
                  {{ formatNumber(row.original.credit) }}
                </span>
                <span v-else-if="!row.original.isHeader">-</span>
              </template>
            </UTable>
          </div>

          <!-- Footer Total (Pinned/Fixed di Bawah Card Tabel) -->
          <div class="shrink-0 flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800/80 border-t font-bold text-xs z-10">
            <span>TOTAL GENERAL JOURNAL</span>
            <div class="space-x-8 font-mono text-blue-600 dark:text-blue-400">
              <span>DEBIT: {{ formatNumber(totalDebit) }}</span>
              <span>KREDIT: {{ formatNumber(totalCredit) }}</span>
            </div>
          </div>

        </UCard>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
