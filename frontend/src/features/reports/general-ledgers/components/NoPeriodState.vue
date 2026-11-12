<script setup lang="ts">
interface Props {
    title?: string;
    message?: string;
}

withDefaults(defineProps<Props>(), {
    title: 'Tidak Ada Periode Aktif',
    message: 'Silakan pilih atau buat periode akuntansi terlebih dahulu untuk menampilkan data buku besar.',
});
</script>

<template>
    <div
        class="flex min-h-[320px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>

        <h3 class="mt-4 text-base font-semibold text-gray-900">
            {{ title }}
        </h3>

        <p class="mt-1 max-w-sm text-sm text-gray-500">
            {{ message }}
        </p>

        <div v-if="$slots.default" class="mt-6">
            <slot />
        </div>
    </div>
</template>