<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'

interface Props {
  initialMode?: 'login' | 'register'
}

withDefaults(defineProps<Props>(), {
  initialMode: 'register',
})

const emit = defineEmits<{
  (e: 'success'): void
}>()

const name = ref('')
const email = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !name.value) return

  isLoading.value = true
  try {
    // Logika pendaftaran via API kamu
    // await authApi.register({ name: name.value, email: email.value })

    emit('success')
  } catch (error) {
    console.error('Register error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSuccess = (response: any) => {
  console.log('Google Register Success:', response)
  emit('success')
}
</script>

<template>
  <div class="space-y-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Nama Lengkap</Label>
        <Input
          id="name"
          v-model="name"
          type="text"
          placeholder="Nama Anda"
          required
          :disabled="isLoading"
          class="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
      </div>

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
        :disabled="isLoading"
      >
        <span v-if="isLoading">Mendaftar...</span>
        <span v-else>Daftar Akun Baru</span>
      </Button>
    </form>

    <div class="relative flex items-center justify-center py-2">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-zinc-800" />
      </div>
      <div class="relative bg-zinc-950 px-2 text-xs text-zinc-400">ATAU</div>
    </div>

    <!-- Google Register Button -->
    <Button
      type="button"
      variant="outline"
      class="w-full border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
      @click="handleGoogleSuccess"
    >
      Sign up with Google
    </Button>
  </div>
</template>
