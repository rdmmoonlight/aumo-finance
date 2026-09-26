<script setup lang="ts">
interface AccountProfile {
  userId: string
  email: string
  userName: string
  fullName: string
  roles: string[]
}

defineProps<{
  members: AccountProfile[]
}>()
</script>

<template>
  <ul role="list" class="divide-y divide-default">
    <li
      v-for="member in members"
      :key="member.userId"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar :alt="member.fullName || member.userName" size="md" />

        <div class="text-sm min-w-0">
          <p class="text-highlighted font-medium truncate">
            {{ member.fullName || member.userName }}
          </p>
          <p class="text-muted truncate">
            {{ member.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <UBadge
          v-for="role in member.roles"
          :key="role"
          color="neutral"
          variant="subtle"
          class="capitalize"
        >
          {{ role }}
        </UBadge>
      </div>
    </li>
  </ul>
</template>
