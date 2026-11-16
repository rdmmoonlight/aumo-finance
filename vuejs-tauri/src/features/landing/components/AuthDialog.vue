<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LoginPage from '@/features/auth/LoginPage.vue'
import RegisterPage from '@/features/auth/RegisterPage.vue'

interface Props {
  authMode: 'login' | 'register'
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

// Menyambungkan binding v-model:open dari parent
const open = defineModel<boolean>('open', { default: false })

const handleSuccess = () => {
  emit('success')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-white sm:max-w-md">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle class="text-lg font-medium text-zinc-100">
          {{ authMode === 'login' ? 'Sign In to Aumo' : 'Create an Account' }}
        </DialogTitle>
      </DialogHeader>

      <div class="p-6 pt-4">
        <LoginPage v-if="authMode === 'login'" initial-mode="login" @success="handleSuccess" />
        <RegisterPage v-else initial-mode="register" @success="handleSuccess" />
      </div>
    </DialogContent>
  </Dialog>
</template>
