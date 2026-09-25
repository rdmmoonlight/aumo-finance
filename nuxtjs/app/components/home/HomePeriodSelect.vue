<script setup lang="ts">
import type { Period } from '~/types'

const model = defineModel<Period>({ required: true })

const periods = [
  { label: 'Monthly', value: 'monthly' as Period },
  { label: 'Annual', value: 'annual' as Period }
]
</script>

<template>
  <USelect
    v-model="model"
    :items="periods"
    value-key="value"
    variant="ghost"
    class="data-[state=open]:bg-elevated"
    :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
  />
</template>
