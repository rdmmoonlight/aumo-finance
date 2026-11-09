<script setup>
import { ArrowRight, Loader2, Lock, UserPlus } from 'lucide-vue-next'

defineProps({
  checkingAuth: { type: Boolean, required: true },
})

const emit = defineEmits(['login', 'register'])
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-black p-6 lg:p-12">
    <div class="max-w-sm text-center">
      <h2 class="text-2xl font-semibold tracking-tight">Selamat Datang</h2>
      <p class="mt-2 text-sm text-zinc-400">
        Silakan masuk atau buat akun baru untuk mengakses dashboard.
      </p>
    </div>

    <div class="flex w-full max-w-sm flex-col items-center gap-3 sm:flex-row">
      <button
        :disabled="checkingAuth"
        type="button"
        class="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        @click="emit('login')"
      >
        <Loader2 v-if="checkingAuth" class="h-4 w-4 animate-spin" />
        <Lock v-else class="h-4 w-4" />
        <span>{{ checkingAuth ? 'Checking...' : 'Sign In' }}</span>
        <ArrowRight v-if="!checkingAuth" class="h-4 w-4" />
      </button>

      <button
        :disabled="checkingAuth"
        type="button"
        class="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 hover:text-white disabled:opacity-50"
        @click="emit('register')"
      >
        <UserPlus class="h-4 w-4" />
        <span>Register</span>
      </button>
    </div>
  </div>
</template>
