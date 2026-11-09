<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useGetProfileQuery } from '../auth/api/auth.api.ts'
import AuthDialog from './components/AuthDialog.vue'
import LandingLeft from './components/LandingLeft.vue'
import LandingRight from './components/LandingRight.vue'

const router = useRouter()

// Asumsi query mengembalikan refs (isLoading, data)
const { data: profile, isLoading: checkingAuth } = useGetProfileQuery()

// State lokal
const open = ref(false)
const authMode = ref<'login' | 'register'>('login')

const handleOpenModal = (mode: 'login' | 'register') => {
  authMode.value = mode
  open.value = true
}

const handleSuccess = () => {
  open.value = false
  router.replace('/home')
}

// Redirect otomatis jika user sudah login
watchEffect(() => {
  if (profile.value) {
    router.replace('/home')
  }
})
</script>

<template>
  <div
    v-if="!profile"
    class="grid min-h-screen w-full bg-black text-white lg:grid-cols-[1.15fr_1fr]"
  >
    <LandingLeft />

    <LandingRight
      :checking-auth="checkingAuth"
      @login="handleOpenModal('login')"
      @register="handleOpenModal('register')"
    />

    <AuthDialog v-model:open="open" :auth-mode="authMode" @success="handleSuccess" />
  </div>
</template>
