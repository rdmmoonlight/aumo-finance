<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { useLoginMutation } from './auth.api'
import GoogleSignIn from './components/GoogleSignIn.vue'
import { getAuthErrorMessage } from './error'

interface Props {
  initialMode?: 'login' | 'register'
}

withDefaults(defineProps<Props>(), {
  initialMode: 'login',
})

const emit = defineEmits<{
  (e: 'success'): void
}>()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const login = useLoginMutation()

const handleSubmit = async () => {
  if (!email.value || !password.value || login.isPending.value) return

  errorMessage.value = ''
  try {
    const res = await login.mutateAsync({ email: email.value, password: password.value })
    if (res?.success === false) {
      errorMessage.value = res.message || 'Email atau kata sandi salah.'
      return
    }
    emit('success')
  } catch (e) {
    errorMessage.value = getAuthErrorMessage(e)
  }
}
</script>

<template>
  <div class="space-y-4">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="login-email">Email</Label>
        <Input id="login-email" v-model="email" type="email" autocomplete="email" placeholder="nama@email.com" required
          :disabled="login.isPending.value" class="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500" />
      </div>

      <div class="space-y-2">
        <Label for="login-password">Kata Sandi</Label>
        <Input id="login-password" v-model="password" type="password" autocomplete="current-password" required
          :disabled="login.isPending.value" class="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500" />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-400" role="alert">{{ errorMessage }}</p>

      <Button type="submit" class="w-full bg-white text-black hover:bg-zinc-200" :disabled="login.isPending.value">
        {{ login.isPending.value ? 'Memproses...' : 'Masuk' }}
      </Button>
    </form>

    <div class="relative flex items-center justify-center py-2">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-zinc-800" />
      </div>
      <div class="relative bg-zinc-950 px-2 text-xs text-zinc-400">ATAU</div>
    </div>

    <GoogleSignIn @success="emit('success')" />
  </div>
</template>
