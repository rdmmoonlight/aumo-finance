<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header Halaman -->
    <JournalEntryHeader :entry-number="entry?.entryNumber" :status="entryStatus" />

    <!-- Component Alert Notification -->
    <JournalAlerts
      :error-message="errorMessage"
      :is-balanced="isBalanced"
      :has-lines="lines.length > 0"
      :total-debit="totalDebit"
      :total-credit="totalCredit"
      :status="entryStatus"
    />

    <!-- Kartu Informasi Transaksi (Tanggal, Ref, Deskripsi) -->
    <TransactionInfoCard
      v-model:transaction-date="transactionDate"
      v-model:reference-number="referenceNumber"
      v-model:description="description"
      :is-read-only="isReadOnly"
    />

    <!-- Tabel Baris Transaksi Debit & Kredit -->
    <JournalLinesTable
      :lines="lines"
      :accounts="accounts"
      :is-read-only="isReadOnly"
      @add-line="addLine"
      @remove-line="removeLine"
      @update-line="updateLine"
    />

    <!-- Footer Summary Total Debit & Kredit -->
    <JournalEntryFooter
      :total-debit="totalDebit"
      :total-credit="totalCredit"
      :is-balanced="isBalanced"
    />

    <!-- Tombol Aksi Form (Simpan / Post / Batal) -->
    <JournalFormActions
      :status="entryStatus"
      :is-submitting="isSubmitting"
      :is-balanced="isBalanced"
      @cancel="handleCancel"
      @save-draft="handleSaveDraft"
      @post="handlePost"
      @cancel-entry="handleCancelEntry"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import JournalAlerts from './components/JournalAlerts.vue'
import JournalEntryFooter from './components/JournalEntryFooter.vue'
import JournalEntryHeader from './components/JournalEntryHeader.vue'
import JournalFormActions from './components/JournalFormActions.vue'
import JournalLinesTable from './components/JournalLinesTable.vue'
import TransactionInfoCard from './components/TransactionInfoCard.vue'

import { useAvailableAccounts } from './hooks/useAvailableAccounts'
import { useJournalEntryDetail } from './hooks/useJournalEntryDetail'
import { useJournalForm } from './hooks/useJournalForm'
import { createJournalEntryApi } from './journal-entry.api.ts'

const route = useRoute()
const router = useRouter()
const entryId = route.params.id as string | undefined

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Load daftar akun & detail entri jurnal (jika mode edit/view)
const { accounts } = useAvailableAccounts()
const { entry, fetchDetail } = useJournalEntryDetail(entryId)

// Form composable
const {
  transactionDate,
  referenceNumber,
  description,
  lines,
  totalDebit,
  totalCredit,
  isBalanced,
  addLine,
  removeLine,
  updateLine,
} = useJournalForm()

// Sync data saat detail entri berhasil dimuat
watch(entry, (newEntry) => {
  if (newEntry) {
    transactionDate.value = newEntry.transactionDate
    referenceNumber.value = newEntry.referenceNumber || ''
    description.value = newEntry.description
    lines.value = newEntry.lines
  }
})

// Status entri jurnal
const entryStatus = computed(() => entry.value?.status || 'DRAFT')
const isReadOnly = computed(() => entryStatus.value !== 'DRAFT')

// Handlers
const handleCancel = () => {
  router.push('/journal-entries')
}

const handleSaveDraft = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    const payload = {
      transactionDate: transactionDate.value,
      referenceNumber: referenceNumber.value,
      description: description.value,
      lines: lines.value,
    }

    if (entryId) {
      // Logic update jika API mendukung update
    } else {
      const created = (await createJournalEntryApi(payload)) as { id: string }
      router.push(`/journal-entries/${created.id}`)
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal menyimpan draf jurnal'
  } finally {
    isSubmitting.value = false
  }
}

const handlePost = async () => {
  if (!isBalanced.value) return
  isSubmitting.value = true
  errorMessage.value = null
  try {
    let currentId = entryId
    if (!currentId) {
      const created = (await createJournalEntryApi({
        transactionDate: transactionDate.value,
        referenceNumber: referenceNumber.value,
        description: description.value,
        lines: lines.value,
      })) as { id: string }
      currentId = created.id
    }

    await createJournalEntryApi(currentId)
    await fetchDetail(currentId)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal melakukan posting jurnal'
  } finally {
    isSubmitting.value = false
  }
}
</script>
