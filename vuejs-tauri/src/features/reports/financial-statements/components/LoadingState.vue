<script setup lang="ts">
interface Props {
    message?: string;
}

withDefaults(defineProps<Props>(), {
    message: 'Memuat data laporan keuangan...',
});
</script>

<template>
    <div
        class="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-lg border border-gray-100 bg-white shadow-sm">
        <div class="relative w-12 h-12 mb-4">
            <!-- Outer Spinner -->
            <div class="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        </div>
        <p class="text-sm font-medium text-gray-600 animate-pulse">
            {{ message }}
        </p>
    </div>
</template>