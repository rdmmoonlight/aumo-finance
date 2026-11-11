<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LoginPage from './LoginPage.vue'
import RegisterPage from './RegisterPage.vue'
import { resolvePostLoginPath } from './redirect'

defineProps<{ mode: 'login' | 'register' }>()

const route = useRoute()
const router = useRouter()

const handleSuccess = () => {
  router.replace(resolvePostLoginPath(router, route.query.redirect))
}
</script>

<template>
  <main class="flex min-h-screen w-full items-center justify-center bg-black p-6 text-white">
    <div class="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <h1 class="text-lg font-medium text-zinc-100">
        {{ mode === 'login' ? 'Sign In to Aumo' : 'Create an Account' }}
      </h1>

      <div class="pt-4">
        <LoginPage v-if="mode === 'login'" @success="handleSuccess" />
        <RegisterPage v-else @success="handleSuccess" />
      </div>

      <div class="mt-6 flex justify-between text-xs text-zinc-400">
        <RouterLink to="/" class="hover:text-white">&larr; Kembali</RouterLink>
        <RouterLink
          v-if="mode === 'login'"
          :to="{ name: 'register', query: route.query }"
          class="hover:text-white"
        >
          Belum punya akun? Daftar
        </RouterLink>
        <RouterLink v-else :to="{ name: 'login', query: route.query }" class="hover:text-white">
          Sudah punya akun? Masuk
        </RouterLink>
      </div>
    </div>
  </main>
</template>
