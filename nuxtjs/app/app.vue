<script setup lang="ts">
const colorMode = useColorMode()
const route = useRoute()

// Sesuaikan warna theme-color berdasarkan mode
const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

// Rute publik yang dapat diakses tanpa login
const publicRoutes = ['/', '/login', '/register']

// Contoh simulasi status auth (ganti dengan composable auth Anda, misal: useAuth() atau useUserSession())
const isAuthenticated = ref(false) 

// Cek akses halaman
watchEffect(() => {
  const isPublicRoute = publicRoutes.includes(route.path)

  // Jika user belum login dan mencoba mengakses halaman selain rute publik, redirect ke login
  if (!isAuthenticated.value && !isPublicRoute) {
    navigateTo('/login')
  }
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

// Metadata SEO disesuaikan untuk Landing Page utama
const title = 'Selamat Datang - Platform Kelola Bisnis'
const description = 'Platform terpadu untuk memantau performa, menganalisis data penjualan, dan mengelola bisnis Anda secara efisien.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>