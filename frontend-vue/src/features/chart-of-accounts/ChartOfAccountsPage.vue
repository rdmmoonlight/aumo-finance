<template>
    <div class="flex-1 space-y-6 p-8">
        <!-- Header Halaman -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-3xl font-bold tracking-tight">Bagan Akun (Chart of Accounts)</h2>
                <p class="text-muted-foreground">
                    Kelola daftar akun buku besar untuk pencatatan transaksi keuangan.
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
        <AccountsTable :accounts="accounts" :is-loading="isLoading" @edit-account="handleOpenEditModal"
            @delete-account="handleOpenDeleteModal" />

        <!-- Dialog Form & Hapus -->
        <AccountDialogs v-model:is-form-open="isFormOpen" v-model:is-delete-open="isDeleteOpen"
            :is-loading="isSubmitting" :editing-account="editingAccount" :deleting-account="deletingAccount"
            :available-parents="availableParents" @submit-form="handleSubmitForm"
            @confirm-delete="handleConfirmDelete" />
    </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import { useCreateChartOfAccountMutation, useDeleteChartOfAccountMutation, useGetChartOfAccountsQuery, useUpdateChartOfAccountMutation } from './chart-of-accounts.api.ts'
import AccountDialogs from './components/AccountDialogs.vue'
import AccountsTable from './components/AccountsTable.vue'
import type { Account, CreateAccountPayload, UpdateAccountPayload } from './types'

// States
const accounts = ref<Account[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const accountsQuery = useGetChartOfAccountsQuery()

const isFormOpen = ref(false)
const isDeleteOpen = ref(false)

const editingAccount = ref<Account | null>(null)
const deletingAccount = ref<Account | null>(null)

// Computed: Daftar induk akun yang bisa dipilih (mencegah memilih dirinya sendiri sebagai parent)
const availableParents = computed(() => {
    if (!editingAccount.value) return accounts.value
    return accounts.value.filter((acc) => acc.id !== editingAccount.value?.id)
})

// Handlers
const fetchAccounts = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
        const { data } = await accountsQuery.refetch()
        accounts.value = (data ?? []) as Account[]
    } catch (err: unknown) {
        errorMessage.value = err instanceof Error ? err.message : 'Gagal memuat data bagan akun'
    } finally {
        isLoading.value = false
    }
}

const handleOpenCreateModal = () => {
    editingAccount.value = null
    isFormOpen.value = true
}

const handleOpenEditModal = (account: Account) => {
    editingAccount.value = account
    isFormOpen.value = true
}

const handleOpenDeleteModal = (account: Account) => {
    deletingAccount.value = account
    isDeleteOpen.value = true
}

const handleSubmitForm = async (values: CreateAccountPayload | UpdateAccountPayload) => {
    isSubmitting.value = true
    errorMessage.value = null
    try {
        if (editingAccount.value) {
            await useUpdateChartOfAccountMutation().mutateAsync({
                id: Number(editingAccount.value.id),
                updateAccountRequest: values as UpdateAccountPayload,
            })
        } else {
            await useCreateChartOfAccountMutation().mutateAsync(values as CreateAccountPayload)
        }
        isFormOpen.value = false
        await fetchAccounts()
    } catch (err: unknown) {
        errorMessage.value = err instanceof Error ? err.message : 'Gagal menyimpan data akun'
    } finally {
        isSubmitting.value = false
    }
}

const handleConfirmDelete = async () => {
    if (!deletingAccount.value) return
    isSubmitting.value = true
    errorMessage.value = null
    try {
        await useDeleteChartOfAccountMutation().mutateAsync({ id: Number(deletingAccount.value.id) })
        isDeleteOpen.value = false
        await fetchAccounts()
    } catch (err: unknown) {
        errorMessage.value = err instanceof Error ? err.message : 'Gagal menghapus akun'
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchAccounts()
})
</script>