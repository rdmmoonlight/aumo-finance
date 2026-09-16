<!-- pages/home.vue -->
<template>
  <div class="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
    <h1 class="text-3xl font-bold flex items-center gap-2">
      <Icon name="tabler:circle-check" class="text-emerald-500 w-8 h-8" />
      Berhasil Masuk ke Halaman Web!
    </h1>
    
    <NuxtLink to="/">
      <Button variant="outline" class="gap-2 cursor-pointer">
        <Icon name="tabler:arrow-left" class="w-4 h-4" />
        Kembali ke Landing Page
      </Button>
    </NuxtLink>
  </div>
</template>