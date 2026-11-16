<template>
  <div class="flex-1 space-y-6 p-8">
    <!-- Header Halaman -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Bagan Akun (Chart of Accounts)</h2>
        <p class="text-muted-foreground">
          Kelola daftar akun buku besar untuk pencatatan transaksi keuangan.
          <span v-if="selectedPeriodName"> Periode saldo: {{ selectedPeriodName }}.</span>
        </p>
      </div>
      <Button @click="handleOpenCreateModal">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Akun
      </Button>
    </div>

    <!-- Alert Error Jika Ada -->
    <Alert v-if="errorMessage" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Gagal</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Tabel Akun -->
    <AccountsTable
      :accounts="accounts"
      :is-loading="isLoading"
      @edit-account="handleOpenEditModal"
      @delete-account="handleOpenDeleteModal"
    />

    <!-- Dialog Form & Hapus -->
    <AccountDialogs
      v-model:is-form-open="isFormOpen"
      v-model:is-delete-open="isDeleteOpen"
      :is-loading="isSubmitting"
      :editing-account="editingAccount"
      :deleting-account="deletingAccount"
      @submit-form="handleSubmitForm"
      @confirm-delete="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Plus } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import {
  useCreateChartOfAccountMutation,
  useDeleteChartOfAccountMutation,
  useGetChartOfAccountsQuery,
  useUpdateChartOfAccountMutation,
} from './chart-of-accounts.api'
import AccountDialogs from './components/AccountDialogs.vue'
import AccountsTable from './components/AccountsTable.vue'
import type { Account, AccountFormValues } from './types'

// Query & mutation harus dipanggil di level setup (bukan di dalam handler).
const accountsQuery = useGetChartOfAccountsQuery()
const createMutation = useCreateChartOfAccountMutation()
const updateMutation = useUpdateChartOfAccountMutation()
const deleteMutation = useDeleteChartOfAccountMutation()

// Data berasal langsung dari query; tidak ada salinan state manual.
const accounts = computed<Account[]>(() => accountsQuery.data.value?.accounts ?? [])
const selectedPeriodName = computed(() => accountsQuery.data.value?.selectedPeriodName ?? null)
const isLoading = computed(() => accountsQuery.isPending.value)

const isSubmitting = computed(
  () =>
    createMutation.isPending.value || updateMutation.isPending.value || deleteMutation.isPending.value,
)

const actionError = ref<string | null>(null)

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const editingAccount = ref<Account | null>(null)
const deletingAccount = ref<Account | null>(null)

// Mengambil pesan dari Error, atau dari body error backend ({ message }).
const extractMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

const errorMessage = computed(() => {
  if (actionError.value) return actionError.value
  if (accountsQuery.isError.value) {
    return extractMessage(accountsQuery.error.value, 'Gagal memuat data bagan akun')
  }
  return null
})

// Handlers
const handleOpenCreateModal = () => {
  actionError.value = null
  editingAccount.value = null
  isFormOpen.value = true
}

const handleOpenEditModal = (account: Account) => {
  actionError.value = null
  editingAccount.value = account
  isFormOpen.value = true
}

const handleOpenDeleteModal = (account: Account) => {
  actionError.value = null
  deletingAccount.value = account
  isDeleteOpen.value = true
}

const handleSubmitForm = async (values: AccountFormValues) => {
  actionError.value = null
  try {
    if (editingAccount.value) {
      await updateMutation.mutateAsync({
        id: editingAccount.value.id,
        updateAccountRequest: {
          referenceNumber: values.referenceNumber,
          accountName: values.accountName,
          type: values.type,
          role: values.role,
          isActive: values.isActive,
        },
      })
    } else {
      await createMutation.mutateAsync({
        referenceNumber: values.referenceNumber,
        accountName: values.accountName,
        type: values.type,
        role: values.role,
      })
    }
    isFormOpen.value = false
    editingAccount.value = null
  } catch (err: unknown) {
    actionError.value = extractMessage(err, 'Gagal menyimpan data akun')
  }
}

const handleConfirmDelete = async () => {
  if (!deletingAccount.value) return
  actionError.value = null
  try {
    await deleteMutation.mutateAsync({ id: deletingAccount.value.id })
    isDeleteOpen.value = false
    deletingAccount.value = null
  } catch (err: unknown) {
    isDeleteOpen.value = false
    actionError.value = extractMessage(err, 'Gagal menghapus akun')
  }
}
</script>
