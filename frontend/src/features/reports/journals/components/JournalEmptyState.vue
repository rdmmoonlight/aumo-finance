<script setup lang="ts">
import { BookX } from 'lucide-vue-next';

interface Props {
    selectedPeriodName?: string | null
}

defineProps<Props>()
</script>

<template>
    <div class="flex flex-col items-center gap-2 text-muted-foreground py-2">
        <BookX class="h-7 w-7" />
        <p class="text-sm font-medium">No Entries Found</p>
        <p class="text-xs">
            No entries in
            <strong class="text-foreground">
                {{ selectedPeriodName || 'this period' }}
            </strong>
        </p>
    </div>
</template>