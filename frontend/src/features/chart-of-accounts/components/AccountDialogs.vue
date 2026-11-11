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
          <!-- Kode Akun -->
          <FormField v-slot="{ componentField }" name="code">
            <FormItem>
              <FormLabel>Kode Akun</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: 1001" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Nama Akun -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Nama Akun</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kas Utama" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
                  <SelectItem value="ASSET">Aset (Asset)</SelectItem>
                  <SelectItem value="LIABILITY">Kewajiban (Liability)</SelectItem>
                  <SelectItem value="EQUITY">Ekuitas (Equity)</SelectItem>
                  <SelectItem value="REVENUE">Pendapatan (Revenue)</SelectItem>
                  <SelectItem value="EXPENSE">Beban (Expense)</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Sub Akun Dari (Parent Account) -->
          <FormField v-slot="{ componentField }" name="parentId">
            <FormItem>
              <FormLabel>Induk Akun (Opsional)</FormLabel>

              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Induk Akun (Kosongkan jika akun utama)" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  <SelectItem :value="null">-- Tidak Ada Induk --</SelectItem>
                  <SelectItem v-for="acc in props.availableParents" :key="acc.id" :value="acc.id">
                    {{ acc.code }} - {{ acc.name }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Deskripsi -->
          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan tambahan mengenai akun ini"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
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
            <strong>{{ props.deletingAccount?.name }}</strong>
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
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import * as z from 'zod'

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
import { Textarea } from '@/components/ui/textarea'

import type { Account, AccountType } from '../types'

interface Props {
  isFormOpen?: boolean
  isDeleteOpen?: boolean
  isLoading?: boolean
  editingAccount?: Account | null
  deletingAccount?: Account | null
  availableParents?: Account[]
}

const props = withDefaults(defineProps<Props>(), {
  isFormOpen: false,
  isDeleteOpen: false,
  isLoading: false,
  editingAccount: null,
  deletingAccount: null,
  availableParents: () => [],
})

const emit = defineEmits<{
  'update:isFormOpen': [value: boolean]
  'update:isDeleteOpen': [value: boolean]
  'submit-form': [
    values: {
      code: string
      name: string
      type: AccountType
      parentId?: string | null
      description?: string
    },
  ]
  'confirm-delete': []
}>()

const formSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Kode akun wajib diisi'),
    name: z.string().min(1, 'Nama akun wajib diisi'),
    type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], {
      required_error: 'Tipe akun wajib dipilih',
    }),
    parentId: z.string().nullable().optional(),
    description: z.string().optional(),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    code: '',
    name: '',
    type: 'ASSET' as AccountType,
    parentId: null,
    description: '',
  },
})

watch(
  () => props.editingAccount,
  (newVal) => {
    if (newVal) {
      form.setValues({
        code: newVal.code,
        name: newVal.name,
        type: newVal.type,
        parentId: newVal.parentId || null,
        description: newVal.description || '',
      })
    } else {
      form.resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit((values) => {
  emit('submit-form', values)
})
</script>
