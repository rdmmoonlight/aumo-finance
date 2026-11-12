<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-vue-next';

defineProps<{
    isBalanced: boolean
    balancedText: string
    unbalancedText: string
}>()
</script>

<template>
    <Alert :class="isBalanced
            ? 'border-emerald-500/20 bg-emerald-500/10 text-ui'
            : 'border-red-500/20 bg-red-500/10 text-ui'
        ">
        <CheckCircle2 :size="16" />
        <AlertDescription class="text-caption">
            {{ isBalanced ? balancedText : unbalancedText }}
        </AlertDescription>
    </Alert>
</template>