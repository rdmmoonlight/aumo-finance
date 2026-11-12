<script setup lang="ts">
interface Props {
    title?: string;
    message?: string;
    actionLabel?: string;
}

withDefaults(defineProps<Props>(), {
    title: 'Periode Akuntansi Tidak Ditemukan',
    message: 'Silakan pilih atau buat periode akuntansi aktif terlebih dahulu untuk melihat laporan keuangan.',
    actionLabel: 'Kelola Periode',
});

const emit = defineEmits<{
    (e: 'action'): void;
}>();
</script>

<template>
    <div
        class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 mb-4">
            <!-- Calendar / Empty Icon -->
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        </div>

        <h3 class="text-base font-semibold text-gray-900">
            {{ title }}
        </h3>
        <p class="mt-1 max-w-md text-sm text-gray-500">
            {{ message }}
        </p>

        <div class="mt-6" v-if="$attrs.onAction">
            <button type="button" @click="emit('action')"
                class="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors">
                {{ actionLabel }}
            </button>
        </div>
    </div>
</template>