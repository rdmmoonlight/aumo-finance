<script setup lang="ts">
import { EyeOff } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
</script>

<template>
    <div class="flex flex-col items-center gap-2 text-muted-foreground py-2">
        <EyeOff class="h-7 w-7" />
        <p class="text-sm font-medium">No Period Selected</p>
        <p class="text-xs">
            Go to
            <RouterLink to="/periods" class="text-primary underline underline-offset-4">
                Periods
            </RouterLink>
            to select a period.
        </p>
    </div>
</template>