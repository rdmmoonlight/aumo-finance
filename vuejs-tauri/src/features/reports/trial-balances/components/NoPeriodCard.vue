<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, EyeOff } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

withDefaults(
    defineProps<{
        message?: string
    }>(),
    {
        message: 'Select a period to view trial balance.',
    },
)
</script>

<template>
    <Card class="border-dashed py-16 text-center">
        <CardContent class="space-y-3">
            <EyeOff :size="36" class="mx-auto text-muted-foreground" />
            <h3 class="font-semibold text-ui">No Period Selected</h3>
            <p class="text-ui text-muted-foreground">{{ message }}</p>
            <Button as-child size="sm">
                <RouterLink to="/periods" class="gap-1.5 text-caption">
                    <Calendar :size="14" /> Go to Periods
                </RouterLink>
            </Button>
        </CardContent>
    </Card>
</template>