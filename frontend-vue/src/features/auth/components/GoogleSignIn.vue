<script setup lang="ts">
import { ref } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import { useGoogleLoginMutation } from '../api/auth.api'
import { GOOGLE_CLIENT_ID } from '../config'
import { getAuthErrorMessage } from '../error'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const errorMessage = ref('')
const googleLogin = useGoogleLoginMutation()

const onCredential = async (response: { credential?: string }) => {
  if (!response.credential) {
    errorMessage.value = 'Token Google tidak diterima.'
    return
  }
  errorMessage.value = ''
  try {
    const res = await googleLogin.mutateAsync({ idToken: response.credential })
    if (res?.success === false) {
      errorMessage.value = res.message || 'Login Google gagal.'
      return
    }
    emit('success')
  } catch (e) {
    errorMessage.value = getAuthErrorMessage(e)
  }
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="!GOOGLE_CLIENT_ID" class="rounded-md border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
      Login Google belum dikonfigurasi (PUBLIC_GOOGLE_CLIENT_ID kosong).
    </p>
    <div v-else class="flex justify-center">
      <GoogleLogin :client-id="GOOGLE_CLIENT_ID" :callback="onCredential" />
    </div>
    <p v-if="errorMessage" class="text-center text-xs text-red-400" role="alert">{{ errorMessage }}</p>
  </div>
</template>
