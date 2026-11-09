<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import { useLoginThrottle } from './composables/useLoginThrottle'

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
const isLoading = ref(false)

const { isThrottled, remainingTime, startThrottle } = useLoginThrottle(60)

const handleSubmit = async () => {
  if (!email.value || isThrottled.value) return

  isLoading.value = true
  try {
    // Jalankan logika API login kamu di sini
    // await authApi.login({ email: email.value })

    startThrottle()
    emit('success')
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSuccess = (response: any) => {
  // Callback saat login Google berhasil
  console.log('Google Auth Success:', response)
  emit('success')
}
</script>

<template>
  <div class="space-y-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="nama@email.com"
          required
          :disabled="isLoading"
          class="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
      </div>

      <Button
        type="submit"
        class="w-full bg-white text-black hover:bg-zinc-200"
        :disabled="isLoading || isThrottled"
      >
        <span v-if="isLoading">Loading...</span>
        <span v-else-if="isThrottled">Kirim ulang dalam {{ remainingTime }}s</span>
        <span v-else>Masuk / Kirim OTP</span>
      </Button>
    </form>

    <div class="relative flex items-center justify-center py-2">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-zinc-800" />
      </div>
      <div class="relative bg-zinc-950 px-2 text-xs text-zinc-400">ATAU</div>
    </div>

    <!-- Google Login Button -->
    <!-- Jika pakai plugin vue3-google-login, gunakan komponen bawaannya seperti <GoogleLogin :callback="handleGoogleSuccess" /> -->
    <Button
      type="button"
      variant="outline"
      class="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
      @click="handleGoogleSuccess"
    >
      Continue with Google
    </Button>
  </div>
</template>
