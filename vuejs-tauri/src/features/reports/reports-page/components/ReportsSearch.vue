<script setup lang="ts">
import { Search } from 'lucide-vue-next';

defineProps<{
    modelValue: string
}>()

defineEmits<{
    'update:modelValue': [value: string]
}>()
</script>

<template>
    <div class="relative mt-6">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input type="text" :value="modelValue" placeholder="Cari laporan: journal, ledger, cash flow..."
            class="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    </div>
</template>