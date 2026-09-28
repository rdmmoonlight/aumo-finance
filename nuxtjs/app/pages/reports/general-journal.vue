<!-- pages/reports/general-journal.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const isLoading = ref(false)
const journalData = ref<any[]>([])

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

// Format Rupiah / Angka
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(num || 0)
}

onMounted(fetchReport)
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Laporan Jurnal Umum (General Journal)" badge="Report">
        <template #right>
          <UButton
            icon="i-lucide-printer"
            color="neutral"
            variant="outline"
            label="Cetak"
            @click="() => window.print()"
          />
          <UButton
            icon="i-lucide-download"
            color="primary"
            label="Export Excel"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-6 space-y-6">
        <!-- Breadcrumb / Back button -->
        <div>
          <UButton
            to="/reports"
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            size="xs"
            label="Kembali ke Pusat Laporan"
          />
        </div>

        <!-- Card Tabel Laporan Jurnal -->
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
                  <th class="p-3 border-b">Tanggal</th>
                  <th class="p-3 border-b">No. Transaksi</th>
                  <th class="p-3 border-b">Kode Akun & Nama Akun</th>
                  <th class="p-3 border-b text-right">Debit</th>
                  <th class="p-3 border-b text-right">Kredit</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <template v-for="entry in journalData" :key="entry.Id">
                  <!-- Header Entry -->
                  <tr class="bg-neutral-100/50 dark:bg-neutral-800/30 font-semibold">
                    <td class="p-3">{{ new Date(entry.EntryDate).toLocaleDateString('id-ID') }}</td>
                    <td class="p-3 text-blue-600 dark:text-blue-400">{{ entry.TransactionNumber }}</td>
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
                        <span>{{ line.ChartOfAccounts?.AccountName }}</span>
                        <p v-if="line.LineDescription" class="text-[11px] text-neutral-400 italic mt-0.5">{{ line.LineDescription }}</p>
                      </div>
                    </td>
                    <td class="p-2.5 text-right font-mono">{{ Number(line.Debit) > 0 ? formatNumber(Number(line.Debit)) : '-' }}</td>
                    <td class="p-2.5 text-right font-mono">{{ Number(line.Credit) > 0 ? formatNumber(Number(line.Credit)) : '-' }}</td>
                  </tr>
                </template>

                <tr v-if="journalData.length === 0 && !isLoading">
                  <td colspan="5" class="text-center p-8 text-neutral-400">Belum ada data jurnal umum.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
