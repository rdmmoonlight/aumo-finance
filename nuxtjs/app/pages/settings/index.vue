<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const loading = ref(false)
const loadingAvatar = ref(false)

const authUser = useAuthUser()

// GET /api/v1/auth/me does not return phoneNumber/bio/avatarUrl, only
// fullName/userName/email/roles - so only those two fields are safely
// editable here. Sending phoneNumber/bio blind would risk wiping out
// values already saved on the account (UpdateProfile compares against
// the current record and null looks like "clear this field").
const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  userName: z.string().min(3, 'Username must be at least 3 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  fullName: '',
  userName: ''
})

watch(authUser, (user) => {
  if (!user) return
  state.fullName = user.fullName ?? ''
  state.userName = user.userName ?? ''
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/v1/settings/profile', {
      method: 'PUT',
      body: {
        fullName: event.data.fullName,
        userName: event.data.userName
      }
    })

    await fetchAuthUser()

    toast.add({ title: 'Success', description: 'Profile updated successfully.', color: 'success' })
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
    toast.add({ title: 'Error', description: message || 'Failed to update profile.', color: 'error' })
  } finally {
    loading.value = false
  }
}

// avatarUrl also isn't returned by /me, so the preview only reflects
// what was just uploaded this session - it won't persist across a
// page refresh until the backend's /me response includes it.
const avatarPreview = ref<string | null>(null)

async function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  loadingAvatar.value = true
  try {
    const form = new FormData()
    form.append('avatar', file)

    const response = await $fetch<{ success: boolean, avatarUrl: string }>('/api/v1/settings/avatar', {
      method: 'POST',
      body: form
    })

    avatarPreview.value = response.avatarUrl
    toast.add({ title: 'Success', description: 'Avatar uploaded.', color: 'success' })
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
    toast.add({ title: 'Error', description: message || 'Failed to upload avatar.', color: 'error' })
  } finally {
    loadingAvatar.value = false
    input.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <UPageCard
      title="Profile"
      description="Informasi akun Anda."
      variant="naked"
      orientation="horizontal"
    >
      <div class="flex items-center gap-3 lg:ms-auto">
        <UAvatar :src="avatarPreview ?? undefined" :alt="state.fullName || state.userName" size="lg" />

        <UButton
          label="Ganti foto"
          color="neutral"
          variant="outline"
          size="sm"
          :loading="loadingAvatar"
          @click="($refs.avatarInput as HTMLInputElement)?.click()"
        />
        <input
          ref="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          class="hidden"
          @change="onAvatarChange"
        >
      </div>
    </UPageCard>

    <UPageCard variant="subtle">
      <UForm
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4 max-w-sm"
        @submit="onSubmit"
      >
        <UFormField label="Full name" name="fullName">
          <UInput v-model="state.fullName" class="w-full" />
        </UFormField>

        <UFormField label="Username" name="userName">
          <UInput v-model="state.userName" class="w-full" />
        </UFormField>

        <UFormField label="Email">
          <UInput :model-value="authUser?.email" disabled class="w-full" />
        </UFormField>

        <UFormField v-if="authUser?.roles?.length" label="Roles">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="role in authUser.roles"
              :key="role"
              color="neutral"
              variant="subtle"
              class="capitalize"
            >
              {{ role }}
            </UBadge>
          </div>
        </UFormField>

        <UButton
          type="submit"
          label="Save changes"
          class="w-fit"
          :loading="loading"
        />
      </UForm>
    </UPageCard>
  </div>
</template>
