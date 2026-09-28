<!-- pages/journal-entries.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

interface LineInput {
  accountId: number | null
  lineDescription: string
  debit: number
  credit: number
}

// States
const entries = ref<any[]>([])
const accounts = ref<any[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const selectedId = ref<number | null>(null)

// Form State
const form = reactive({
  journalType: 'General',
  entryDate: new Date().toISOString().substring(0, 10),
  transactionNumber: '',
  lines: [
    { accountId: null, lineDescription: '', debit: 0, credit: 0 },
    { accountId: null, lineDescription: '', debit: 0, credit: 0 },
  ] as LineInput[],
})

// Calculations
const totalDebit = computed(() => form.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0))
const totalCredit = computed(() => form.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0))
const isBalanced = computed(() => Math.abs(totalDebit.value - totalCredit.value) < 0.01 && totalDebit.value > 0)

// Data Fetching
const fetchData = async () => {
  isLoading.value = true
  try {
    const [entriesRes, accountsRes]: [any, any] = await Promise.all([
      $fetch('/api/v1/journal-entries'),$fetch('/api/v1/chart-of-accounts'),
    ])
    entries.value = entriesRes || []
    accounts.value = accountsRes || []
  } catch (err) {
    console.error('Failed to load data:', err)
  } finally {
    isLoading.value = false
  }
}

// Line operations
const addLine = () => {
  form.lines.push({ accountId: null, lineDescription: '', debit: 0, credit: 0 })
}

const removeLine = (index: number) => {
  if (form.lines.length > 2) {
    form.lines.splice(index, 1)
  }
}

// Form Handlers
const resetForm = () => {
  form.journalType = 'General'
  form.entryDate = new Date().toISOString().substring(0, 10)
  form.transactionNumber = `JV-${Date.now().toString().slice(-6)}`
  form.lines = [
    { accountId: null, lineDescription: '', debit: 0, credit: 0 },
    { accountId: null, lineDescription: '', debit: 0, credit: 0 },
  ]
  isEditing.value = false
  selectedId.value = null
}

const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const handleSave = async () => {
  if (!isBalanced.value) return

  try {
    if (isEditing.value && selectedId.value) {
      await $fetch(`/api/v1/journal-entries/${selectedId.value}`, {
        method: 'PUT',
        body: form,
      })
    } else {
      await $fetch('/api/v1/journal-entries', {
        method: 'POST',
        body: form,
      })
    }
    isModalOpen.value = false
    fetchData()
  } catch (err: any) {
    alert(err.data?.message || 'Gagal menyimpan entri jurnal')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return
  try {
    await $fetch(`/api/v1/journal-entries/${id}`, { method: 'DELETE' })
    fetchData()
  } catch (err) {
    console.error('Delete error:', err)
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(num || 0)
}

onMounted(fetchData)
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <!-- Navbar / Header Konsisten -->
      <UDashboardNavbar title="General Journal" badge="Pencatatan">
        <template #right>
          <UButton
            icon="i-lucide-plus"
            color="primary"
            label="Buat Jurnal Baru"
            @click="openCreateModal"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-6 space-y-6">
        <!-- Container Card Tabel -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-bold text-base">Daftar Transaksi Jurnal Umum</h3>
                <p class="text-xs text-neutral-500">Kelola dan catat ringkasan transaksi debit/kredit keuangan.</p>
              </div>
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                size="xs"
                :loading="isLoading"
                @click="fetchData"
              />
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-neutral-50 dark:bg-neutral-800/50 uppercase font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th class="p-3 border-b">Tanggal</th>
                  <th class="p-3 border-b">No. Transaksi</th>
                  <th class="p-3 border-b">Rincian Akun & Keterangan</th>
                  <th class="p-3 border-b text-right">Debit</th>
                  <th class="p-3 border-b text-right">Kredit</th>
                  <th class="p-3 border-b text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <template v-for="entry in entries" :key="entry.Id">
                  <!-- Entry Header Row -->
                  <tr class="bg-neutral-100/50 dark:bg-neutral-800/30 font-semibold">
                    <td class="p-3">{{ new Date(entry.EntryDate).toLocaleDateString('id-ID') }}</td>
                    <td class="p-3 text-blue-600 dark:text-blue-400">{{ entry.TransactionNumber }}</td>
                    <td class="p-3" colspan="3">
                      <UBadge size="xs" color="neutral" variant="subtle">{{ entry.JournalType }}</UBadge>
                    </td>
                    <td class="p-3 text-center">
                      <UButton
                        color="error"
                        variant="ghost"
                        size="xs"
                        label="Hapus"
                        @click="handleDelete(entry.Id)"
                      />
                    </td>
                  </tr>
                  <!-- Detail Account Lines -->
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
                    <td></td>
                  </tr>
                </template>

                <tr v-if="entries.length === 0 && !isLoading">
                  <td colspan="6" class="text-center p-8 text-neutral-400">Belum ada transaksi jurnal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>

        <!-- Modal Form Input Jurnal -->
        <UModal v-model:open="isModalOpen" title="Input Transaksi Jurnal Umum">
          <template #body>
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-medium text-neutral-500 mb-1">Tipe Jurnal</label>
                  <UInput v-model="form.journalType" size="sm" class="w-full" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-500 mb-1">Tanggal</label>
                  <UInput v-model="form.entryDate" type="date" size="sm" class="w-full" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-neutral-500 mb-1">No. Transaksi</label>
                  <UInput v-model="form.transactionNumber" size="sm" class="w-full" />
                </div>
              </div>

              <!-- Lines Detail -->
              <div class="space-y-2">
                <label class="block text-xs font-semibold">Rincian Akun (Debit / Kredit)</label>
                <div v-for="(line, idx) in form.lines" :key="idx" class="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded border border-neutral-200 dark:border-neutral-800">
                  <select v-model="line.accountId" class="border dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded p-1.5 text-xs flex-1">
                    <option :value="null">-- Pilih Akun --</option>
                    <option v-for="acc in accounts" :key="acc.Id" :value="acc.Id">
                      {{ acc.ReferenceNumber }} - {{ acc.AccountName }}
                    </option>
                  </select>
                  <UInput v-model="line.lineDescription" placeholder="Keterangan" size="sm" class="flex-1" />
                  <UInput v-model.number="line.debit" placeholder="Debit" type="number" size="sm" class="w-28 text-right" />
                  <UInput v-model.number="line.credit" placeholder="Kredit" type="number" size="sm" class="w-28 text-right" />
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="i-lucide-x"
                    size="xs"
                    :disabled="form.lines.length <= 2"
                    @click="removeLine(idx)"
                  />
                </div>
                <UButton icon="i-lucide-plus" size="xs" variant="ghost" color="primary" label="Tambah Baris" @click="addLine" />
              </div>

              <!-- Balance Indicator -->
              <div class="flex justify-between items-center p-3 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 font-mono text-xs">
                <div>
                  Status: 
                  <span v-if="isBalanced" class="text-emerald-600 font-bold">SEIMBANG (Balanced)</span>
                  <span v-else class="text-rose-600 font-bold">BELUM SEIMBANG</span>
                </div>
                <div class="space-x-3">
                  <span>D: <strong>{{ formatNumber(totalDebit) }}</strong></span>
                  <span>K: <strong>{{ formatNumber(totalCredit) }}</strong></span>
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" label="Batal" @click="isModalOpen = false" />
              <UButton color="primary" label="Simpan Jurnal" :disabled="!isBalanced" @click="handleSave" />
            </div>
          </template>
        </UModal>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
