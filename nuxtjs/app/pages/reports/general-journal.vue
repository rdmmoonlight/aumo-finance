<!-- pages/reports/general-journal.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const isLoading = ref(false)
const journalData = ref<any[]>([])
const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')

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

// Filter data berdasarkan kata kunci pencarian
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

// Kalkulasi Total Debit & Kredit Laporan
const totalDebit = computed(() => {
  return filteredData.value.reduce((acc, entry) => {
    const entrySum = entry.JournalEntryLines?.reduce((sum: number, line: any) => sum + (Number(line.Debit) || 0), 0) || 0
    return acc + entrySum
  }, 0)
})

const totalCredit = computed(() => {
  return filteredData.value.reduce((acc, entry) => {
    const entrySum = entry.JournalEntryLines?.reduce((sum: number, line: any) => sum + (Number(line.Credit) || 0), 0) || 0
    return acc + entrySum
  }, 0)
})

// Safe Print Handler
const handlePrint = () => {
  if (import.meta.client) {
    window.print()
  }
}

// Format Angka Rupiah
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(num || 0)
}

onMounted(fetchReport)
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <!-- Navbar / Header Laporan -->
      <UDashboardNavbar title="Laporan Jurnal Umum (General Journal)" badge="Report">
        <template #right>
          <UButton
            icon="i-lucide-printer"
            color="neutral"
            variant="outline"
            label="Cetak"
            @click="handlePrint"
          />
          <UButton
            icon="i-lucide-download"
            color="primary"
            label="Export Excel"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-6 space-y-6">
        <!-- Breadcrumb & Filter Bar -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <UButton
            to="/reports"
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            size="xs"
            label="Kembali ke Pusat Laporan"
          />

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Cari transaksi / akun..."
              size="xs"
              class="w-full sm:w-64"
            />
          </div>
        </div>

        <!-- Card Tabel Utama Laporan Jurnal -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-bold text-base">Rincian Transaksi Jurnal Umum</h3>
                <p class="text-xs text-neutral-500">Menampilkan seluruh baris debit dan kredit berdasar urutan tanggal.</p>
              </div>
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                size="xs"
                :loading="isLoading"
                @click="fetchReport"
              />
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-neutral-50 dark:bg-neutral-800/50 uppercase font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th class="p-3 border-b border-neutral-200 dark:border-neutral-800">Tanggal</th>
                  <th class="p-3 border-b border-neutral-200 dark:border-neutral-800">No. Transaksi</th>
                  <th class="p-3 border-b border-neutral-200 dark:border-neutral-800">Kode Akun & Nama Akun</th>
                  <th class="p-3 border-b border-neutral-200 dark:border-neutral-800 text-right">Debit</th>
                  <th class="p-3 border-b border-neutral-200 dark:border-neutral-800 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <template v-for="entry in filteredData" :key="entry.Id">
                  <!-- Entry Header Row -->
                  <tr class="bg-neutral-100/50 dark:bg-neutral-800/30 font-semibold">
                    <td class="p-3">{{ new Date(entry.EntryDate).toLocaleDateString('id-ID') }}</td>
                    <td class="p-3 text-blue-600 dark:text-blue-400 font-mono">{{ entry.TransactionNumber }}</td>
                    <td class="p-3" colspan="3">
                      <UBadge size="xs" color="neutral" variant="subtle">{{ entry.JournalType }}</UBadge>
                    </td>
                  </tr>
                  <!-- Detail Lines -->
                  <tr v-for="line in entry.JournalEntryLines" :key="line.Id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800/20">
                    <td colspan="2"></td>
                    <td class="p-2.5 pl-6">
                      <div :class="{ 'pl-6': Number(line.Credit) > 0 }">
                        <span class="font-mono text-neutral-400 mr-2">[{{ line.ChartOfAccounts?.ReferenceNumber }}]</span>
                        <span class="font-medium text-neutral-800 dark:text-neutral-200">{{ line.ChartOfAccounts?.AccountName }}</span>
                        <p v-if="line.LineDescription" class="text-[11px] text-neutral-400 italic mt-0.5">{{ line.LineDescription }}</p>
                      </div>
                    </td>
                    <td class="p-2.5 text-right font-mono">{{ Number(line.Debit) > 0 ? formatNumber(Number(line.Debit)) : '-' }}</td>
                    <td class="p-2.5 text-right font-mono">{{ Number(line.Credit) > 0 ? formatNumber(Number(line.Credit)) : '-' }}</td>
                  </tr>
                </template>

                <!-- Status Kosong -->
                <tr v-if="filteredData.length === 0 && !isLoading">
                  <td colspan="5" class="text-center p-8 text-neutral-400">Tidak ada data jurnal yang sesuai.</td>
                </tr>
              </tbody>

              <!-- Footer Total Laporan -->
              <tfoot v-if="filteredData.length > 0" class="bg-neutral-100 dark:bg-neutral-800/60 font-bold border-t border-neutral-300 dark:border-neutral-700">
                <tr>
                  <td colspan="3" class="p-3 text-right uppercase text-xs">Total General Journal:</td>
                  <td class="p-3 text-right font-mono text-blue-600 dark:text-blue-400">{{ formatNumber(totalDebit) }}</td>
                  <td class="p-3 text-right font-mono text-blue-600 dark:text-blue-400">{{ formatNumber(totalCredit) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </UCard>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
