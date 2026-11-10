<template>
  <div class="flex items-center justify-between border-t pt-4">
    <!-- Action Kiri (misal: Hapus jika mode edit) -->
    <div>
      <Button
        v-if="isEditMode && !isReadOnly"
        type="button"
        variant="destructive"
        :disabled="isSubmitting"
        @click="emit('delete')"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Hapus Jurnal
      </Button>
    </div>

    <!-- Action Kanan (Batal & Simpan) -->
    <div class="flex items-center space-x-2">
      <Button type="button" variant="outline" :disabled="isSubmitting" @click="emit('cancel')">
        {{ isReadOnly ? 'Kembali' : 'Batal' }}
      </Button>

      <Button
        v-if="!isReadOnly"
        type="submit"
        :disabled="isSubmitting || !isBalanced"
        @click="emit('submit')"
      >
        <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        {{ isEditMode ? 'Perbarui Jurnal' : 'Simpan Jurnal' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Loader2, Save, Trash2 } from 'lucide-vue-next'

interface Props {
  isSubmitting?: boolean
  isReadOnly?: boolean
  isEditMode?: boolean
  isBalanced?: boolean
}

withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  isReadOnly: false,
  isEditMode: false,
  isBalanced: true,
})

const emit = defineEmits<{
  cancel: []
  submit: []
  delete: []
}>()
</script>
