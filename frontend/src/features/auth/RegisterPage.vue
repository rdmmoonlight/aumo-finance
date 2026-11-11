<script setup lang="ts">
import GoogleSignIn from './components/GoogleSignIn.vue'

interface Props {
  initialMode?: 'login' | 'register'
}

withDefaults(defineProps<Props>(), {
  initialMode: 'register',
})

const emit = defineEmits<{
  (e: 'success'): void
}>()
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-zinc-400">Pendaftaran akun baru dilakukan melalui akun Google Anda.</p>
    <GoogleSignIn @success="emit('success')" />
  </div>
</template>
