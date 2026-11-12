<script setup lang="ts">
interface Props {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Gagal Memuat Data',
    message: 'Terjadi kesalahan saat mengambil data laporan keuangan. Silakan coba lagi.',
});

const emit = defineEmits<{
    (e: 'retry'): void;
}>();

const handleRetry = () => {
    if (props.onRetry) {
        props.onRetry();
    }
    emit('retry');
};
</script>

<template>
    <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
        <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
                <!-- Error Icon -->
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>

            <div class="flex-1">
                <h3 class="text-base font-semibold text-red-800">
                    {{ title }}
                </h3>
                <p class="mt-1 text-sm text-red-700">
                    {{ message }}
                </p>

                <div class="mt-4" v-if="onRetry || $attrs.onRetry">
                    <button type="button" @click="handleRetry"
                        class="inline-flex items-center gap-2 rounded-md bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Coba Lagi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>