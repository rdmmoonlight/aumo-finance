<!-- pages/coa.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

export interface ChartOfAccount {
  id: number
  referenceNumber: number
  accountName: string
  type: string
  role?: string
  isActive?: boolean
}

const ACCOUNT_TYPES = [
  'Assets',
  'Liabilities',
  'Equity',
  'OperatingIncome',
  'OperatingExpenses',
  'OtherIncome',
  'OtherExpenses'
]

const ACCOUNT_RANGES: Record<string, { start: number; end: number; label: string }> = {
  Assets: { start: 100, end: 199, label: 'Assets (100-199)' },
  Liabilities: { start: 200, end: 299, label: 'Liabilities (200-299)' },
  Equity: { start: 300, end: 399, label: 'Equity (300-399)' },
  OperatingIncome: { start: 400, end: 499, label: 'Operating Income (400-499)' },
  OperatingExpenses: { start: 500, end: 599, label: 'Operating Expenses (500-599)' },
  OtherIncome: { start: 600, end: 799, label: 'Other Income (600-799)' },
  OtherExpenses: { start: 800, end: 999, label: 'Other Expenses (800-999)' }
}

const ENDPOINTS = {
  LIST: '/api/v1/chart-of-accounts',
  CREATE: '/api/v1/chart-of-accounts',
  UPDATE: (id: number) => `/api/v1/chart-of-accounts/${id}`,
  DELETE: (id: number) => `/api/v1/chart-of-accounts/${id}`
}

// State Utama Page
const accounts = ref<ChartOfAccount[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// State Dialogs
const isAddOpen = ref(false)
const isEditOpen = ref(false)
const isDeleteOpen = ref(false)

const activeAccount = ref<ChartOfAccount | null>(null)

// Form Add State
const addForm = ref({
  type: '',
  referenceNumber: 0,
  accountName: '',
  role: 'Default'
})
const isCreating = ref(false)
const addError = ref<string | null>(null)

// Form Edit State
const editForm = ref<ChartOfAccount>({
  id: 0,
  referenceNumber: 0,
  accountName: '',
  type: '',
  role: 'Default',
  isActive: true
})
const isUpdating = ref(false)
const editError = ref<string | null>(null)

// Delete State
const isDeleting = ref(false)

// Select Options
const categoryOptions = ACCOUNT_TYPES.map(t => ({
  label: ACCOUNT_RANGES[t].label,
  value: t
}))

// --- API ACTIONS ---
const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const data: any = await $fetch(ENDPOINTS.LIST)
    accounts.value = Array.isArray(data) ? data : data?.items || []
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Failed to load accounts'
  } finally {
    isLoading.value = false
  }
}

const handleCategoryChange = (value: string) => {
  addForm.value.type = value
  addForm.value.referenceNumber = ACCOUNT_RANGES[value]?.start || 0
}

const handleAddSubmit = async () => {
  addError.value = null
  const refNum = Number(addForm.value.referenceNumber)
  const range = ACCOUNT_RANGES[addForm.value.type]

  if (range && (refNum < range.start || refNum > range.end)) {
    addError.value = `Ref ${refNum} not valid for ${addForm.value.type} (${range.start}-${range.end})`
    return
  }

  if (accounts.value.some(a => Number(a.referenceNumber) === refNum)) {
    addError.value = `Code ${refNum} already used`
    return
  }

  isCreating.value = true
  try {
    await $fetch(ENDPOINTS.CREATE, {
      method: 'POST',
      body: {
        referenceNumber: refNum,
        accountName: addForm.value.accountName,
        type: addForm.value.type,
        role: addForm.value.role
      }
    })

    successMessage.value = `Account '${addForm.value.accountName}' created`
    isAddOpen.value = false
    addForm.value = { type: '', referenceNumber: 0, accountName: '', role: 'Default' }
    await fetchAccounts()
  } catch (err: any) {
    addError.value = err?.data?.message || err?.message || 'Failed to create account'
  } finally {
    isCreating.value = false
  }
}

const openEditModal = (account: ChartOfAccount) => {
  activeAccount.value = account
  editForm.value = { ...account }
  editError.value = null
  isEditOpen.value = true
}

const handleEditSubmit = async () => {
  editError.value = null
  isUpdating.value = true
  try {
    await $fetch(ENDPOINTS.UPDATE(editForm.value.id), {
      method: 'PUT',
      body: {
        referenceNumber: editForm.value.referenceNumber,
        accountName: editForm.value.accountName,
        type: editForm.value.type,
        role: editForm.value.role,
        isActive: editForm.value.isActive
      }
    })

    successMessage.value = `Account '${editForm.value.accountName}' updated`
    isEditOpen.value = false
    await fetchAccounts()
  } catch (err: any) {
    editError.value = err?.data?.message || err?.message || 'Failed to update account'
  } finally {
    isUpdating.value = false
  }
}

const openDeleteModal = (account: ChartOfAccount) => {
  activeAccount.value = account
  isDeleteOpen.value = true
}

const handleDelete = async () => {
  if (!activeAccount.value) return
  isDeleting.value = true
  try {
    await $fetch(ENDPOINTS.DELETE(activeAccount.value.id), { method: 'DELETE' })
    successMessage.value = `Deleted '${activeAccount.value.accountName}'`
    isDeleteOpen.value = false
    await fetchAccounts()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Failed to delete account'
    isDeleteOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto p-4">
    <!-- Alert Messages -->
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :title="errorMessage"
      icon="i-lucide-triangle-alert"
      :close-button="{ icon: 'i-lucide-x' }"
      @close="errorMessage = null"
    />
    <UAlert
      v-if="successMessage"
      color="success"
      variant="subtle"
      :title="successMessage"
      icon="i-lucide-check-circle"
      :close-button="{ icon: 'i-lucide-x' }"
      @close="successMessage = null"
    />

    <!-- Header & Trigger Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-book-open" class="size-5" /> Chart of Accounts
        </h1>
        <p class="text-sm text-muted mt-1">Manage financial accounts and categorization</p>
      </div>
      <UButton size="sm" icon="i-lucide-plus" @click="isAddOpen = true">
        Add New Account
      </UButton>
    </div>

    <!-- Table Container -->
    <UCard class="overflow-hidden bg-[#151519] border border-white/[0.07]" :ui="{ body: 'p-0' }">
      <template #header>
        <div class="flex items-center justify-between py-1">
          <span class="text-sm font-semibold text-white">Accounts List</span>
          <UBadge variant="subtle" color="neutral">{{ accounts.length }} total</UBadge>
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06] text-zinc-500 text-left">
              <th class="pl-6 py-3">Ref No</th>
              <th>Account Name</th>
              <th>Type</th>
              <th class="pr-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="4" class="text-center py-8 text-zinc-500">
                <UIcon name="i-lucide-loader-2" class="animate-spin inline mr-2" /> Loading accounts...
              </td>
            </tr>
            <tr
              v-for="acc in accounts"
              :key="acc.id"
              class="border-b border-white/[0.06] hover:bg-white/[0.03]"
            >
              <td class="pl-6 py-3 font-mono text-xs text-zinc-400">
                {{ acc.referenceNumber }}
              </td>
              <td class="font-medium text-zinc-200">
                {{ acc.accountName }}
              </td>
              <td>
                <UBadge color="neutral" variant="subtle" size="xs">
                  {{ acc.type }}
                </UBadge>
              </td>
              <td class="pr-6 py-3">
                <div class="flex justify-center gap-1.5">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pencil"
                    @click="openEditModal(acc)"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    @click="openDeleteModal(acc)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && accounts.length === 0">
              <td colspan="4" class="text-center py-12 text-zinc-500">
                <UIcon name="i-lucide-folder-open" class="size-7 mx-auto mb-2 block" /> No accounts found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- --- ADD ACCOUNT MODAL --- -->
    <UModal v-model:open="isAddOpen" title="Add New Account">
      <template #body>
        <form id="add-form" @submit.prevent="handleAddSubmit" class="space-y-4">
          <UAlert
            v-if="addError"
            color="error"
            variant="subtle"
            :title="addError"
            icon="i-lucide-triangle-alert"
          />

          <UFormField label="Category" required>
            <USelect
              v-model="addForm.type"
              :items="categoryOptions"
              placeholder="Select Category"
              class="w-full"
              @update:model-value="handleCategoryChange"
            />
          </UFormField>

          <UFormField label="Reference Number" required>
            <UInput
              v-model.number="addForm.referenceNumber"
              type="number"
              :disabled="!addForm.type"
              class="w-full"
            />
            <template #help>
              <span class="text-xs text-muted">
                {{ addForm.type ? `Valid: ${ACCOUNT_RANGES[addForm.type].start}-${ACCOUNT_RANGES[addForm.type].end}` : 'Select category first' }}
              </span>
            </template>
          </UFormField>

          <UFormField label="Account Name" required>
            <UInput v-model="addForm.accountName" placeholder="e.g. Cash in Bank" class="w-full" />
          </UFormField>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="isAddOpen = false">Cancel</UButton>

          <UButton type="submit" form="add-form" :loading="isCreating">Save Account</UButton>
        </div>
      </template>
    </UModal>

    <!-- --- EDIT ACCOUNT MODAL --- -->
    <UModal v-model:open="isEditOpen" title="Edit Account">
      <template #body>
        <form id="edit-form" @submit.prevent="handleEditSubmit" class="space-y-4">
          <UAlert
            v-if="editError"
            color="error"
            variant="subtle"
            :title="editError"
            icon="i-lucide-triangle-alert"
          />

          <UFormField label="Account Name" required>
            <UInput v-model="editForm.accountName" class="w-full" />
          </UFormField>

          <UFormField label="Reference Number" required>
            <UInput v-model.number="editForm.referenceNumber" type="number" class="w-full" />
          </UFormField>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="isEditOpen = false">Cancel</UButton>

          <UButton type="submit" form="edit-form" :loading="isUpdating">Update</UButton>
        </div>
      </template>
    </UModal>

    <!-- --- DELETE ALERT DIALOG --- -->
    <UModal v-model:open="isDeleteOpen" title="Delete Account">
      <template #body>
        <p class="text-sm text-zinc-400">
          Are you sure you want to delete <span class="text-white font-semibold">"{{ activeAccount?.accountName }}"</span>?
          This action cannot be undone.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" :disabled="isDeleting" @click="isDeleteOpen = false">Cancel</UButton>

          <UButton color="error" :loading="isDeleting" @click="handleDelete">Delete</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
