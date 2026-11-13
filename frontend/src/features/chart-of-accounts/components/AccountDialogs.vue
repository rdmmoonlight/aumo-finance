<template>
  <div>
    <!-- Dialog Tambah / Edit Akun -->
    <Dialog :open="props.isFormOpen" @update:open="(val) => emit('update:isFormOpen', val)">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {{ props.editingAccount ? 'Edit Akun' : 'Tambah Akun Baru' }}
          </DialogTitle>
          <DialogDescription>
            Isi rincian informasi akun buku besar di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <form @submit="onSubmit" class="space-y-4">
          <!-- Tipe Akun -->
          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>Tipe Akun</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Akun" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="opt in ACCOUNT_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Kode Akun -->
          <FormField v-slot="{ componentField }" name="referenceNumber">
            <FormItem>
              <FormLabel>Kode Akun</FormLabel>
              <FormControl>
                <Input type="number" inputmode="numeric" :placeholder="referencePlaceholder" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Nama Akun -->
          <FormField v-slot="{ componentField }" name="accountName">
            <FormItem>
              <FormLabel>Nama Akun</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kas Utama" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Peran Akun -->
          <FormField v-slot="{ componentField }" name="role">
            <FormItem>
              <FormLabel>Peran Akun</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Peran Akun" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem v-for="opt in ACCOUNT_ROLE_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Status Aktif (hanya saat edit) -->
          <FormField v-if="props.editingAccount" v-slot="{ value, handleChange }" name="isActive">
            <FormItem class="flex items-center justify-between rounded-md border p-3">
              <FormLabel class="mb-0">Akun Aktif</FormLabel>
              <FormControl>
                <Switch :model-value="Boolean(value)" @update:model-value="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>

          <DialogFooter class="pt-2">
            <Button type="button" variant="outline" @click="emit('update:isFormOpen', false)">
              Batal
            </Button>
            <Button type="submit" :disabled="props.isLoading">
              <Loader2 v-if="props.isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ props.editingAccount ? 'Simpan Perubahan' : 'Tambah Akun' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog Konfirmasi Hapus -->
    <AlertDialog
      :open="props.isDeleteOpen"
      @update:open="(val) => emit('update:isDeleteOpen', val)"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Akun
            <strong>{{ props.deletingAccount?.accountName }}</strong>
            akan dihapus secara permanen dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="emit('update:isDeleteOpen', false)">Batal</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="props.isLoading"
            @click="emit('confirm-delete')"
          >
            <Loader2 v-if="props.isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useForm, type GenericValidateFunction } from 'vee-validate'
import { computed, watch } from 'vue'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import {
  ACCOUNT_ROLE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
  type Account,
  type AccountFormValues,
  type AccountRole,
  type AccountType,
} from '../types'

interface Props {
  isFormOpen?: boolean
  isDeleteOpen?: boolean
  isLoading?: boolean
  editingAccount?: Account | null
  deletingAccount?: Account | null
}

const props = withDefaults(defineProps<Props>(), {
  isFormOpen: false,
  isDeleteOpen: false,
  isLoading: false,
  editingAccount: null,
  deletingAccount: null,
})

const emit = defineEmits<{
  'update:isFormOpen': [value: boolean]
  'update:isDeleteOpen': [value: boolean]
  'submit-form': [values: AccountFormValues]
  'confirm-delete': []
}>()

interface FormState {
  type: AccountType
  referenceNumber: string | number
  accountName: string
  role: AccountRole
  isActive: boolean
}

const getRange = (type: unknown) => ACCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.range

// Validasi ditulis sebagai fungsi biasa agar tidak bergantung pada versi zod.
const referenceNumberRule: GenericValidateFunction = (value, ctx) => {
  const raw = String(value ?? '').trim()
  if (raw === '') return 'Kode akun wajib diisi'
  const n = Number(raw)
  if (!Number.isInteger(n)) return 'Kode akun harus berupa angka bulat'
  const range = getRange((ctx.form as Partial<FormState>).type)
  if (range && (n < range[0] || n > range[1])) {
    return `Kode akun untuk tipe ini harus antara ${range[0]} dan ${range[1]}`
  }
  return true
}

const form = useForm<FormState>({
  validationSchema: {
    type: ((v) => (v ? true : 'Tipe akun wajib dipilih')) as GenericValidateFunction,
    referenceNumber: referenceNumberRule,
    accountName: ((v) =>
      String(v ?? '').trim() ? true : 'Nama akun wajib diisi') as GenericValidateFunction,
    role: ((v) => (v ? true : 'Peran akun wajib dipilih')) as GenericValidateFunction,
  },
  initialValues: {
    type: 'Assets',
    referenceNumber: '',
    accountName: '',
    role: 'Default',
    isActive: true,
  },
})

const referencePlaceholder = computed(() => {
  const range = getRange(form.values.type)
  return range ? `Contoh: ${range[0]}` : 'Contoh: 100'
})

// Isi ulang form setiap kali dialog dibuka (tambah maupun edit).
watch(
  () => [props.isFormOpen, props.editingAccount] as const,
  ([open, account]) => {
    if (!open) return
    if (account) {
      form.resetForm({
        values: {
          type: account.type as AccountType,
          referenceNumber: account.referenceNumber,
          accountName: account.accountName,
          role: account.role as AccountRole,
          isActive: account.isActive,
        },
      })
    } else {
      form.resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit((values) => {
  emit('submit-form', {
    referenceNumber: Number(values.referenceNumber),
    accountName: String(values.accountName).trim(),
    type: values.type,
    role: values.role,
    isActive: Boolean(values.isActive),
  })
})
</script>
