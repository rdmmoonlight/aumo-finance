<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>('open', { default: false })

const links = computed(() => [[
{
    label: 'Home',
  icon: 'i-lucide-house',
  to: '/home',
  onSelect: () => {
    open.value = false
  }
},{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/dashboard',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Inbox',
  icon: 'i-lucide-inbox',
  to: '/inbox',
  badge: '4',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Customers',
  icon: 'i-lucide-users',
  to: '/customers',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Settings',
  to: '/settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  type: 'trigger',
  children: [{
    label: 'General',
    to: '/settings',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Members',
    to: '/settings/members',
    onSelect: () => { open.value = false }
  }, {
    label: 'Notifications',
    to: '/settings/notifications',
    onSelect: () => { open.value = false }
  }, {
    label: 'Security',
    to: '/settings/security',
    onSelect: () => { open.value = false }
  }]
}], [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][])

defineExpose({ links })
</script>
