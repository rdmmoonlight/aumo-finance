<script setup lang="ts">
import { formatDate } from '../format';

interface Props {
    title: string;
    description?: string;
    periodName?: string;
    startDate?: string;
    endDate?: string;
    isClosed?: boolean;
}

defineProps<Props>();
</script>

<template>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
            <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">
                    {{ title }}
                </h1>
                <span v-if="periodName" :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    isClosed
                        ? 'bg-gray-100 text-gray-700 border border-gray-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                ]">
                    {{ periodName }} {{ isClosed ? '(Closed)' : '(Aktif)' }}
                </span>
            </div>

            <p v-if="description" class="mt-1 text-sm text-gray-500">
                {{ description }}
            </p>

            <p v-if="startDate && endDate" class="mt-1 text-xs text-gray-400">
                Rentang Periode: {{ formatDate(startDate) }} – {{ formatDate(endDate) }}
            </p>
        </div>

        <div class="flex items-center gap-2">
            <slot name="actions" />
        </div>
    </div>
</template>