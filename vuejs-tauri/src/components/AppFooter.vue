<template>
  <footer class="w-full border-t border-border/40 py-3">
    <div class="flex flex-col items-center justify-center gap-1 px-6 text-center">
      <!-- Caption (12px) -->
      <p class="text-xs text-muted-foreground">
        © {{ currentYear }} Aumo Finance. All rights reserved.
      </p>

      <!-- Link Navigasi About & API Reference -->
      <div class="flex items-center gap-3 text- text-muted-foreground my-0.5">
        <RouterLink
          to="/about"
          class="hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          About
        </RouterLink>
        <span>•</span>
        <a
          href="/reference/"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          API Reference
        </a>
      </div>

      <!-- Label kecil (11px) -->
      <p class="text- text-muted-foreground">
        by <span class="font-medium text-foreground">rdmmoonlight</span>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()
</script>
