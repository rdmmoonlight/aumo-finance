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
      $fetch('/api/v1/journal-entries'),$fetch('/api/v1/chart-of-accounts'), // Sesuaikan endpoint COA kamu
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

onMounted(fetchData)
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">General Journal</h1>
        <p class="text-sm text-gray-500">Pencatatan transaksi jurnal umum keuangan</p>
      </div>
      <button 
        @click="openCreateModal" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2"
      >
        + Buat Jurnal Baru
      </button>
    </div>

    <!-- Table Jurnal -->
    <div class="bg-white rounded-lg shadow overflow-hidden border">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
          <tr>
            <th class="p-4 border-b">Tanggal</th>
            <th class="p-4 border-b">No. Transaksi</th>
            <th class="p-4 border-b">Rincian Akun & Keterangan</th>
            <th class="p-4 border-b text-right">Debit</th>
            <th class="p-4 border-b text-right">Kredit</th>
            <th class="p-4 border-b text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y text-sm">
          <template v-for="entry in entries" :key="entry.Id">
            <tr class="bg-gray-50 font-medium">
              <td class="p-4">{{ new Date(entry.EntryDate).toLocaleDateString('id-ID') }}</td>
              <td class="p-4 text-blue-600">{{ entry.TransactionNumber }}</td>
              <td class="p-4" colspan="3"><span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ entry.JournalType }}</span></td>
              <td class="p-4 text-center">
                <button @click="handleDelete(entry.Id)" class="text-red-600 hover:underline text-xs">Hapus</button>
              </td>
            </tr>
            <!-- Baris Detail Akun -->
            <tr v-for="line in entry.JournalEntryLines" :key="line.Id" class="hover:bg-gray-50/50">
              <td colspan="2"></td>
              <td class="p-3 pl-8">
                <div :class="{ 'pl-6': Number(line.Credit) > 0 }">
                  <span class="font-mono text-xs text-gray-500 mr-2">{{ line.ChartOfAccounts?.ReferenceNumber }}</span>
                  <span>{{ line.ChartOfAccounts?.AccountName }}</span>
                  <p v-if="line.LineDescription" class="text-xs text-gray-400 italic">{{ line.LineDescription }}</p>
                </div>
              </td>
              <td class="p-3 text-right font-mono">{{ Number(line.Debit) > 0 ? Number(line.Debit).toLocaleString('id-ID') : '-' }}</td>
              <td class="p-3 text-right font-mono">{{ Number(line.Credit) > 0 ? Number(line.Credit).toLocaleString('id-ID') : '-' }}</td>
              <td></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal Form Input/Edit Jurnal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold">Input Transaksi Jurnal Umum</h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Tipe Jurnal</label>
            <input v-model="form.journalType" type="text" class="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
            <input v-model="form.entryDate" type="date" class="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">No. Transaksi</label>
            <input v-model="form.transactionNumber" type="text" class="w-full border rounded p-2 text-sm" />
          </div>
        </div>

        <!-- Dynamic Entry Lines -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold">Detail Akun (Debit / Kredit)</label>
          <div v-for="(line, idx) in form.lines" :key="idx" class="flex gap-2 items-center bg-gray-50 p-2 rounded border">
            <select v-model="line.accountId" class="border rounded p-2 text-sm flex-1">
              <option :value="null">-- Pilih Akun --</option>
              <option v-for="acc in accounts" :key="acc.Id" :value="acc.Id">
                {{ acc.ReferenceNumber }} - {{ acc.AccountName }}
              </option>
            </select>
            <input v-model="line.lineDescription" placeholder="Catatan/Memori" type="text" class="border rounded p-2 text-sm flex-1" />
            <input v-model.number="line.debit" placeholder="Debit" type="number" class="border rounded p-2 text-sm w-32 text-right" />
            <input v-model.number="line.credit" placeholder="Kredit" type="number" class="border rounded p-2 text-sm w-32 text-right" />
            <button @click="removeLine(idx)" class="text-red-500 font-bold px-2" :disabled="form.lines.length <= 2">✕</button>
          </div>
          <button @click="addLine" class="text-sm text-blue-600 font-medium hover:underline">+ Tambah Baris</button>
        </div>

        <!-- Total & Balance Status Indicator -->
        <div class="flex justify-between items-center p-3 rounded border bg-gray-100 font-mono text-sm">
          <div>
            Status: 
            <span v-if="isBalanced" class="text-green-600 font-bold">SEIMBANG (Balanced)</span>
            <span v-else class="text-red-600 font-bold">BELUM SEIMBANG</span>
          </div>
          <div class="space-x-4">
            <span>Total Debit: <strong>{{ totalDebit.toLocaleString('id-ID') }}</strong></span>
            <span>Total Kredit: <strong>{{ totalCredit.toLocaleString('id-ID') }}</strong></span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button @click="isModalOpen = false" class="px-4 py-2 text-sm border rounded">Batal</button>
          <button 
            @click="handleSave" 
            :disabled="!isBalanced" 
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Simpan Jurnal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
