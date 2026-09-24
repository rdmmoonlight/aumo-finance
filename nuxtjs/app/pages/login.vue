<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

const toast = useToast()
const route = useRoute()
const loading = ref(false)

const schema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: '',
  rememberMe: false
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await login(event.data)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect)
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
    toast.add({
      title: 'Login failed',
      description: message || 'Invalid email/username or password.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UPageCard class="w-full max-w-sm" title="Sign in" description="Sign in to your AumoFinance account">
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-4"
      @submit="onSubmit"
    >
      <UFormField label="Email or username" name="email">
        <UInput
          v-model="state.email"
          placeholder="you@example.com"
          class="w-full"
          autofocus
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="••••••••"
          class="w-full"
        />
      </UFormField>

      <UCheckbox v-model="state.rememberMe" label="Remember me" name="rememberMe" />

      <UButton
        type="submit"
        label="Sign in"
        block
        :loading="loading"
      />
    </UForm>
  </UPageCard>
</template>
