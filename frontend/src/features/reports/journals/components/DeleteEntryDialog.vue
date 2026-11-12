<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
    open: boolean
    isDeleting?: boolean
    transactionNumber?: string
}

withDefaults(defineProps<Props>(), {
    isDeleting: false,
})

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'confirm'): void
}>()
</script>

<template>
    <AlertDialog :open="open" @update:open="emit('update:open', $event)">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle class="text-xl font-bold">
                    Delete Journal Entry
                </AlertDialogTitle>
                <AlertDialogDescription class="text-xs text-muted-foreground">
                    Are you sure you want to delete entry
                    <span class="font-mono font-semibold text-foreground">
                        "{{ transactionNumber }}"
                    </span>? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="isDeleting" class="text-sm">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction :disabled="isDeleting"
                    class="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-medium"
                    @click="emit('confirm')">
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>