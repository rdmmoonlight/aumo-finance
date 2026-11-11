<template>
  <Dialog :open="props.open" @update:open="(val) => emit('update:open', val)">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="primary">Buka Periode Baru</Button>
      </slot>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Buka Periode Baru</DialogTitle>
        <DialogDescription>
          Pilih rentang tanggal untuk membuka periode buku kas baru.
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit" class="space-y-4">
        <!-- Tanggal Mulai -->
        <FormField v-slot="{ componentField, value }" name="startDate">
          <FormItem class="flex flex-col">
            <FormLabel>Tanggal Mulai</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl>
                  <Button
                    variant="outline"
                    :class="[
                      'w-full justify-start text-left font-normal',
                      !value && 'text-muted-foreground',
                    ]"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ value ? value : 'Pilih tanggal mulai' }}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar v-bind="componentField" initial-focus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Tanggal Selesai -->
        <FormField v-slot="{ componentField, value }" name="endDate">
          <FormItem class="flex flex-col">
            <FormLabel>Tanggal Selesai</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl>
                  <Button
                    variant="outline"
                    :class="[
                      'w-full justify-start text-left font-normal',
                      !value && 'text-muted-foreground',
                    ]"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ value ? value : 'Pilih tanggal selesai' }}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar v-bind="componentField" initial-focus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter class="pt-2">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Batal
          </Button>
          <Button type="submit" :disabled="props.isLoading">
            <Loader2 v-if="props.isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Simpan & Buka Periode
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { CalendarIcon, Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import * as z from 'zod'

// Directives / UI Components (sesuaikan path shadcn-vue di proyek Anda)
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Props {
  open?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  isLoading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [values: { startDate: string; endDate: string }]
}>()

// Schema Validasi
const formSchema = toTypedSchema(
  z.object({
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  }),
)

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
  emit('submit', values)
})
</script>
