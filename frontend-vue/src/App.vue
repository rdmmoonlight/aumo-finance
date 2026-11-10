<script setup lang="ts">
import AuthenticatedLayout from '@/components/AuthenticatedLayout.vue'
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

const isAuthRequired = computed(() => route.meta.requiresAuth ?? false)
</script>

<template>

  <AuthenticatedLayout v-if="isAuthRequired">
    <RouterView />
  </AuthenticatedLayout>

  <RouterView v-else />
</template>
