<script setup lang="ts">
import * as z from 'zod'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const loadingPassword = ref(false)
const loadingDelete = ref(false)

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: '',
  new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

// Submit ganti password ke API C#
async function onSubmitPassword(event: FormSubmitEvent<PasswordSchema>) {
  loadingPassword.value = true
  try {
    await $fetch('/api/v1/settings/change-password', {
      method: 'POST',
      body: {
        currentPassword: event.data.current,
        newPassword: event.data.new
      }
    })

    toast.add({
      title: 'Success',
      description: 'Password has been updated successfully.',
      color: 'success'
    })

    // Reset form
    password.current = ''
    password.new = ''
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message || 'Failed to update password.',
      color: 'error'
    })
  } finally {
    loadingPassword.value = false
  }
}

// Hapus akun via API C#
async function onDeleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }

  loadingDelete.value = true
  try {
    await $fetch('/api/v1/settings/delete-account', {
      method: 'DELETE'
    })

    toast.add({
      title: 'Account Deleted',
      description: 'Your account has been permanently removed.',
      color: 'success'
    })

    // Redirect ke halaman login setelah akun dihapus
    await navigateTo('/login')
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err?.data?.message || 'Failed to delete account.',
      color: 'error'
    })
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <UPageCard
      title="Password"
      description="Confirm your current password before setting a new one."
      variant="subtle"
    >
      <UForm
        :schema="passwordSchema"
        :state="password"
        :validate="validate"
        class="flex flex-col gap-4 max-w-xs"
        @submit="onSubmitPassword"
      >
        <UFormField name="current">
          <UInput
            v-model="password.current"
            type="password"
            placeholder="Current password"
            class="w-full"
          />
        </UFormField>

        <UFormField name="new">
          <UInput
            v-model="password.new"
            type="password"
            placeholder="New password"
            class="w-full"
          />
        </UFormField>

        <UButton 
          label="Update" 
          class="w-fit" 
          type="submit" 
          :loading="loadingPassword"
        />
      </UForm>
    </UPageCard>

    <UPageCard
      title="Account"
      description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
      class="bg-linear-to-tl from-error/10 from-5% to-default"
    >
      <template #footer>
        <UButton 
          label="Delete account" 
          color="error" 
          :loading="loadingDelete"
          @click="onDeleteAccount"
        />
      </template>
    </UPageCard>
  </div>
</template>